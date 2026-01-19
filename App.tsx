
import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import FormInput from './components/FormInput';
import CurriculumTable from './components/CurriculumTable';
import CertificatePreview from './components/CertificatePreview';
import { CertificateData, DEFAULT_BASE_TEXT, CurriculumItem, Student, Instructor } from './types';
import { fileToBase64 } from './utils/helpers';
import { isValidCPF, isValidCNPJ, validateCertificateData, formatValidationErrors } from './utils/validators';
import { saveCertificateData, loadCertificateData, hasSavedData, clearCertificateData } from './utils/storage';
import { supabase } from './src/supabaseClient';

const App: React.FC = () => {
  const [data, setData] = useState<CertificateData>({
    students: [],
    companyName: '',
    companyCnpj: '',
    address: '',
    providerName: '',
    providerCnpj: '',
    instructors: [],
    techResponsibleName: '',
    techResponsibleCompetencies: '',
    showTechResponsible: true,
    courseName: '',
    courseDate: new Date().toLocaleDateString('pt-BR'),
    totalHours: '0',
    baseText: DEFAULT_BASE_TEXT,
    curriculum: [],
    bgImage: null,
    signatureImage: null,
    digitalSeal: null,
    showHoursColumn: true,
    versoSplitRatio: 40,
    hoursColumnWidth: 80,
    versoRowPadding: 12,
    versoCurriculumFontSize: 12,
    versoHeaderFontSize: 16,
    footerFontSize: 9,
    versoInstitutionVerticalOffset: 0,
    versoCurriculumVerticalOffset: 0,
    mainTextVerticalOffset: 0,
    titleVerticalOffset: 0,
    titleFontSize: 100,
    subtitleFontSize: 24,
    titleSpacing: 24,
    bodyVerticalOffset: 0,
    highlightNameVerticalOffset: 0,
    highlightNameFontSize: 80,
    frontSidePadding: 128,
    signaturesVerticalOffset: 0,
    signaturesHorizontalPadding: 40,
    signatureFontSize: 14,
    frontTextAlign: 'justify',
    boldVariables: ['{{NOME}}', '{{CPF}}', '{{CURSO}}', '{{RAZAO_SOCIAL}}'],
    frontHeaderPadding: 60,
    frontFooterPadding: 24,
    versoHeaderPadding: 48,
    versoFooterPadding: 32,
    frontBorderWidth: 16,
  });

  // ID fixo compartilhado - todos os usuários acessam os mesmos dados
  const SHARED_USER_ID = '00000000-0000-0000-0000-000000000000';
  const [loadingCloud, setLoadingCloud] = useState(false);

  // Carregamento inicial dos dados
  useEffect(() => {
    loadCloudData(SHARED_USER_ID);
  }, []);

  // Carregar dados da nuvem
  const loadCloudData = async (userId: string) => {
    setLoadingCloud(true);
    try {
      const { data: userData, error } = await supabase
        .from('user_data')
        .select('content')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar dados:', error);
        return;
      }

      if (userData && userData.content) {
        setData(prev => ({ ...prev, ...userData.content }));
      } else if (hasSavedData()) {
        const localData = loadCertificateData();
        if (localData) {
          setData(localData);
          saveCloudData(localData, userId);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da nuvem:', error);
    } finally {
      setLoadingCloud(false);
    }
  };

  // Salvar na nuvem
  const saveCloudData = async (newData: CertificateData, userId: string) => {
    try {
      await supabase.from('user_data').upsert({
        user_id: userId,
        content: newData,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Erro ao salvar na nuvem", err);
    }
  };

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCloudData(data, SHARED_USER_ID);
      saveCertificateData(data); // Backup local também
    }, 2000);
    return () => clearTimeout(timer);
  }, [data]);

  const [activeTab, setActiveTab] = useState<'dados' | 'visual' | 'grade'>('dados');
  const [previewPage, setPreviewPage] = useState<1 | 2>(1);
  const [currentStudentIdx, setCurrentStudentIdx] = useState(0);
  const [zoom, setZoom] = useState(0.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [modalScale, setModalScale] = useState(0.8);
  const [isRotated, setIsRotated] = useState(false);
  const [miniPreviewPos, setMiniPreviewPos] = useState<'top' | 'bottom'>('bottom');
  const [isMonitorVisible, setIsMonitorVisible] = useState(false);

  // Ajustar posição do monitor flutuante baseado no scroll e visibilidade
  useEffect(() => {
    const handleScroll = () => {
      setMiniPreviewPos(window.scrollY > 450 ? 'top' : 'bottom');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCpf, setNewStudentCpf] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [newInstructorName, setNewInstructorName] = useState('');
  const [newInstructorCompetencies, setNewInstructorCompetencies] = useState('');

  const availableVariables = [
    { label: 'Nome do Aluno', value: '{{NOME}}' },
    { label: 'CPF', value: '{{CPF}}' },
    { label: 'Curso', value: '{{CURSO}}' },
    { label: 'Data', value: '{{DATA}}' },
    { label: 'Carga Horária', value: '{{CARGA_HORARIA}}' },
    { label: 'Razão Social', value: '{{RAZAO_SOCIAL}}' },
    { label: 'CNPJ', value: '{{CNPJ}}' },
    { label: 'Endereço', value: '{{ENDERECO}}' },
  ];

  // Ajustar escala do modal baseado no tamanho da janela
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;

      if (isMobile) {
        // Se rotacionado, a "largura" visual do certificado A4 landscape vira 794px
        const certWidth = isRotated ? 794 : 1123;
        const targetScale = (width * 0.95) / certWidth;
        setModalScale(targetScale);
      } else {
        setModalScale(0.8);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPreviewOpen, isRotated]);

  // Função de Logout
  const handleLogout = async () => {
    const confirmLogout = window.confirm('🚪 Deseja sair?\n\nSeus dados estão salvos na nuvem.');
    if (confirmLogout) {
      await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    const updateScale = () => {
      if (isPreviewOpen) {
        const availableHeight = window.innerHeight * 0.8;
        const availableWidth = window.innerWidth * 0.9;
        const isDesktop = window.innerWidth > 1280;
        const targetWidth = isDesktop ? 2350 : 1150;
        const targetHeight = 850;
        const scaleH = availableHeight / targetHeight;
        const scaleW = availableWidth / targetWidth;
        setModalScale(Math.min(scaleH, scaleW, 1));
      }
    };
    window.addEventListener('resize', updateScale);
    if (isPreviewOpen) updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, [isPreviewOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    // Auto-show monitor ao editar texto em mobile
    if (window.innerWidth < 768) setIsMonitorVisible(true);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setData(prev => ({ ...prev, [name]: checked }));
    if (window.innerWidth < 768) setIsMonitorVisible(true);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: parseInt(value) }));
    // Ajustes de escala/tamanho ativam o monitor automaticamente no mobile
    if (window.innerWidth < 768) setIsMonitorVisible(true);
  };

  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    setData(prev => ({ ...prev, frontTextAlign: align }));
    if (window.innerWidth < 768) setIsMonitorVisible(true);
  };

  const toggleBoldVariable = (variable: string) => {
    setData(prev => {
      const isBold = prev.boldVariables.includes(variable);
      return {
        ...prev,
        boldVariables: isBold
          ? prev.boldVariables.filter(v => v !== variable)
          : [...prev.boldVariables, variable]
      };
    });
    if (window.innerWidth < 768) setIsMonitorVisible(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'bgImage' | 'signatureImage' | 'digitalSeal') => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setData(prev => ({ ...prev, [field]: base64 }));
      if (window.innerWidth < 768) setIsMonitorVisible(true);
    }
  };

  const addStudent = () => {
    if (!newStudentName || newStudentName.trim() === '') {
      alert('⚠️ Por favor, preencha o nome do aluno');
      return;
    }

    if (!newStudentCpf || newStudentCpf.trim() === '') {
      alert('⚠️ Por favor, preencha o CPF do aluno');
      return;
    }

    if (!isValidCPF(newStudentCpf)) {
      alert('❌ CPF inválido!\n\nVerifique se digitou corretamente.\nFormato aceito: 000.000.000-00 ou 00000000000');
      return;
    }

    const newStudent: Student = {
      id: Math.random().toString(36).substring(2, 9),
      name: newStudentName,
      cpf: newStudentCpf,
      displayName: newStudentName
    };
    setData(prev => ({ ...prev, students: [...prev.students, newStudent] }));
    setNewStudentName('');
    setNewStudentCpf('');
  };

  const addInstructor = () => {
    if (newInstructorName) {
      const newInst: Instructor = {
        id: Math.random().toString(36).substring(2, 9),
        name: newInstructorName,
        competencies: newInstructorCompetencies
      };
      setData(prev => ({ ...prev, instructors: [...prev.instructors, newInst] }));
      setNewInstructorName('');
      setNewInstructorCompetencies('');
    }
  };

  const removeInstructor = (id: string) => {
    const instructor = data.instructors.find(i => i.id === id);
    const shouldRemove = window.confirm(
      `❓ Deseja realmente remover o instrutor?\n\n${instructor?.name || 'Instrutor'}`
    );
    if (shouldRemove) {
      setData(prev => ({ ...prev, instructors: prev.instructors.filter(i => i.id !== id) }));
    }
  };

  const updateStudentDisplayName = (id: string, value: string) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, displayName: value } : s)
    }));
  };

  const removeStudent = (id: string) => {
    const student = data.students.find(s => s.id === id);
    const shouldRemove = window.confirm(
      `❓ Deseja realmente remover o aluno?\n\n${student?.name || 'Aluno'}\nCPF: ${student?.cpf || 'N/A'}`
    );
    if (shouldRemove) {
      setData(prev => ({ ...prev, students: prev.students.filter(s => s.id !== id) }));
      if (currentStudentIdx >= data.students.length - 1) {
        setCurrentStudentIdx(Math.max(0, data.students.length - 2));
      }
    }
  };

  const handleBulkImport = () => {
    const lines = bulkInput.split('\n').filter(line => line.trim() !== '');
    const newStudents: Student[] = lines.map(line => {
      const parts = line.split(/[,\t;]/);
      const name = parts[0]?.trim() || 'Sem Nome';
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: name,
        cpf: parts[1]?.trim() || '000.000.000-00',
        displayName: name
      };
    });
    setData(prev => ({ ...prev, students: [...prev.students, ...newStudents] }));
    setBulkInput('');
  };

  const handleAddCurriculum = (item: CurriculumItem) => {
    setData(prev => {
      const newCurriculum = [...prev.curriculum, item];
      const total = newCurriculum.reduce((acc, curr) => acc + curr.hours, 0);
      return { ...prev, curriculum: newCurriculum, totalHours: total.toString() };
    });
  };

  const handleUpdateCurriculum = (id: string, updatedItem: Partial<CurriculumItem>) => {
    setData(prev => {
      const newCurriculum = prev.curriculum.map(item => item.id === id ? { ...item, ...updatedItem } : item);
      const total = newCurriculum.reduce((acc, curr) => acc + curr.hours, 0);
      return { ...prev, curriculum: newCurriculum, totalHours: total.toString() };
    });
  };

  const handleRemoveCurriculum = (id: string) => {
    setData(prev => {
      const newCurriculum = prev.curriculum.filter(i => i.id !== id);
      const total = newCurriculum.reduce((acc, curr) => acc + curr.hours, 0);
      return { ...prev, curriculum: newCurriculum, totalHours: total.toString() };
    });
  };


  const exportAllToPDF = async () => {
    // Validação completa antes de exportar
    const validationErrors = validateCertificateData(data);
    if (validationErrors.length > 0) {
      alert(formatValidationErrors(validationErrors));
      return;
    }

    setIsGenerating(true);
    try {
      const waitForImages = async (element: HTMLElement) => {
        const imgs = Array.from(element.querySelectorAll('img'));
        const promises = imgs.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });
        await Promise.all(promises);
      };
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const capturePage = async (elementId: string) => {
        const element = document.getElementById(elementId);
        if (!element) return null;
        element.style.width = '1123px';
        element.style.height = '794px';
        await waitForImages(element);
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 1123,
          height: 794
        });
        return canvas;
      };
      for (let i = 0; i < data.students.length; i++) {
        const student = data.students[i];
        const canvas1 = await capturePage(`export-p1-${student.id}`);
        if (canvas1) {
          if (i > 0) pdf.addPage();
          pdf.addImage(canvas1.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
        }
      }
      const canvas2 = await capturePage('export-p2-generic');
      if (canvas2) {
        pdf.addPage();
        pdf.addImage(canvas2.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
      }
      pdf.save(`Certificados_${data.courseName.replace(/\s+/g, '_') || 'Lote'}.pdf`);
      alert(`✅ PDF gerado com sucesso!\n\n${data.students.length} certificado(s) exportado(s).`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("❌ Erro ao exportar o PDF.\n\nVerifique se todos os campos estão preenchidos corretamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStudent = data.students[currentStudentIdx] || null;
  const handleZoom = (delta: number) => setZoom(prev => Math.min(Math.max(prev + delta, 0.15), 1.5));

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden bg-gray-100">
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-7xl flex justify-between items-center mb-6">
            <div className="text-white">
              <h2 className="text-xl font-bold uppercase tracking-widest text-blue-400">Pré-visualização Final</h2>
              <p className="text-xs text-gray-400">Ajustado para caber na tela</p>
            </div>
            <div className="flex gap-2 md:gap-4">
              <button
                onClick={() => setIsRotated(!isRotated)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRotated ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title="Girar Certificado"
              >
                <i className="fa-solid fa-rotate text-xl"></i>
              </button>
              <button onClick={exportAllToPDF} className="bg-green-600 text-white px-4 md:px-8 py-3 rounded-full font-bold shadow-2xl hover:bg-green-700 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95">
                <i className="fa-solid fa-file-pdf"></i> <span className="hidden md:inline">Exportar Tudo</span>
              </button>
              <button onClick={() => { setIsPreviewOpen(false); setIsRotated(false); }} className="bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>
          </div>
          <div className="relative w-full flex-grow flex items-center justify-center overflow-auto scrollbar-hide py-20 px-4">
            <div
              className="flex flex-col xl:flex-row items-center justify-center gap-12 transition-all duration-500 ease-in-out"
              style={{
                transform: `scale(${modalScale}) ${isRotated ? 'rotate(90deg)' : ''}`,
                transformOrigin: 'center center',
                minWidth: isRotated ? '794px' : '1123px',
                minHeight: isRotated ? '1123px' : '794px'
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <span className="text-white/30 font-bold uppercase tracking-tighter text-sm">Página 1: Frente</span>
                <div className="shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border border-white/10">
                  <CertificatePreview data={data} student={currentStudent} page={1} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <span className="text-white/30 font-bold uppercase tracking-tighter text-sm">Página 2: Verso</span>
                <div className="shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border border-white/10">
                  <CertificatePreview data={data} student={null} page={2} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full md:w-[450px] bg-white shadow-xl flex flex-col md:h-full no-print z-20 shrink-0">
        <div className="sticky top-0 z-30 bg-white shadow-md md:relative md:shadow-none">
          <div className="p-4 md:p-6 bg-blue-900 text-white flex justify-between items-center">
            <div>
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap"></i>
                CertificaMaster
              </h1>
              <p className="text-[10px] md:text-xs opacity-75 uppercase tracking-wider">Configurador</p>
            </div>
            <div className="md:hidden bg-white/20 px-2 py-1 rounded text-[10px] font-bold">MOBILE</div>
          </div>
          <div className="flex p-1.5 md:p-2 bg-gray-50 md:bg-gray-100 gap-1 border-b">
            <button
              onClick={() => setActiveTab('dados')}
              className={`flex-1 py-1.5 md:py-3 px-1 md:px-2 rounded-lg text-[10px] md:text-xs font-bold uppercase transition-all duration-200 flex flex-col items-center gap-1 ${activeTab === 'dados' ? 'bg-blue-900 text-white shadow-md transform scale-102 md:scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            >
              <i className="fa-solid fa-user-graduate text-xs md:text-sm"></i>
              Alunos
            </button>
            <button
              onClick={() => setActiveTab('grade')}
              className={`flex-1 py-1.5 md:py-3 px-1 md:px-2 rounded-lg text-[10px] md:text-xs font-bold uppercase transition-all duration-200 flex flex-col items-center gap-1 ${activeTab === 'grade' ? 'bg-blue-900 text-white shadow-md transform scale-102 md:scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            >
              <i className="fa-solid fa-list-check text-xs md:text-sm"></i>
              Grade
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-1.5 md:py-3 px-1 md:px-2 rounded-lg text-[10px] md:text-xs font-bold uppercase transition-all duration-200 flex flex-col items-center gap-1 ${activeTab === 'visual' ? 'bg-blue-900 text-white shadow-md transform scale-102 md:scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            >
              <i className="fa-solid fa-brush text-xs md:text-sm"></i>
              Visual
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 md:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {activeTab === 'dados' && (
            <div className="animate-fadeIn space-y-6">
              <section>
                <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><i className="fa-solid fa-users"></i> Alunos</h2>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="text" placeholder="Nome Completo" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="px-3 py-2 text-sm border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="CPF" value={newStudentCpf} onChange={(e) => setNewStudentCpf(e.target.value)} className="px-3 py-2 text-sm border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <button onClick={addStudent} className="w-full bg-blue-600 text-white py-2 rounded text-sm font-bold hover:bg-blue-700 transition-colors">Adicionar Aluno</button>
                {currentStudent && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
                    <label className="block text-[10px] font-bold text-blue-800 mb-1 uppercase">Nome de Destaque (Manuscrito)</label>
                    <input type="text" value={currentStudent.displayName || ''} onChange={(e) => updateStudentDisplayName(currentStudent.id, e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded border border-dashed mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Importação Massiva (Nome, CPF)</label>
                  <textarea placeholder="João Silva, 123.456.789-00&#10;Maria Souza, 987.654.321-11" className="w-full h-24 text-xs p-2 border rounded font-mono bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} />
                  <button onClick={handleBulkImport} className="mt-2 text-xs font-bold text-blue-600 hover:underline">Processar Lista</button>
                </div>
                <div className="max-h-40 overflow-y-auto border rounded divide-y bg-white">
                  {data.students.length === 0 ? (<p className="p-4 text-center text-xs text-gray-400 italic">Nenhum aluno cadastrado.</p>) : (
                    data.students.map((s, idx) => (
                      <div key={s.id} className={`flex items-center justify-between p-2 text-xs transition-colors ${currentStudentIdx === idx ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                        <div className="cursor-pointer flex-1 font-medium" onClick={() => setCurrentStudentIdx(idx)}><span className="font-bold">{idx + 1}.</span> {s.name}</div>
                        <button onClick={() => removeStudent(s.id)} className="text-red-500 px-2 hover:text-red-700"><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="pt-4 border-t">
                <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><i className="fa-solid fa-chalkboard-user"></i> Instrutores</h2>
                <div className="space-y-2 mb-2">
                  <input type="text" placeholder="Nome do Instrutor" value={newInstructorName} onChange={(e) => setNewInstructorName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Especialidades / Competências" value={newInstructorCompetencies} onChange={(e) => setNewInstructorCompetencies(e.target.value)} className="w-full px-3 py-2 text-sm border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <button onClick={addInstructor} className="w-full bg-blue-600 text-white py-2 rounded text-sm font-bold hover:bg-blue-700 transition-colors mb-4">Adicionar Instrutor</button>

                <div className="max-h-32 overflow-y-auto border rounded divide-y bg-white">
                  {data.instructors.length === 0 ? (<p className="p-3 text-center text-xs text-gray-400 italic">Nenhum instrutor adicionado.</p>) : (
                    data.instructors.map((inst) => (
                      <div key={inst.id} className="flex items-center justify-between p-2 text-xs">
                        <div className="flex-1">
                          <p className="font-bold">{inst.name}</p>
                          <p className="text-gray-500 truncate">{inst.competencies}</p>
                        </div>
                        <button onClick={() => removeInstructor(inst.id)} className="text-red-500 px-2 hover:text-red-700"><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-bold text-gray-500 uppercase mt-8 mb-4 flex items-center gap-2"><i className="fa-solid fa-book"></i> Curso & Entidade</h2>
                <FormInput label="Nome do Curso" name="courseName" value={data.courseName} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-2">
                  <FormInput label="Data Conclusão" name="courseDate" value={data.courseDate} onChange={handleChange} />
                  <FormInput label="Carga Horária" name="totalHours" value={data.totalHours} onChange={handleChange} />
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Dados da Empresa (Rodapé/Frente)</p>
                  <FormInput label="Razão Social" name="companyName" value={data.companyName} onChange={handleChange} />
                  <FormInput label="CNPJ" name="companyCnpj" value={data.companyCnpj} onChange={handleChange} />
                  <FormInput label="Endereço Completo" name="address" value={data.address} onChange={handleChange} multiline />
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-800 uppercase mb-3">Empresa Prestadora/Realização (Verso)</p>
                  <FormInput label="Nome da Prestadora" name="providerName" value={data.providerName} onChange={handleChange} />
                  <FormInput label="CNPJ da Prestadora" name="providerCnpj" value={data.providerCnpj} onChange={handleChange} />
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Responsável Técnico (Selo Digital)</p>
                  <div className="flex items-center gap-2 mb-3">
                    <input type="checkbox" id="showTechResponsible" name="showTechResponsible" checked={data.showTechResponsible} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
                    <label htmlFor="showTechResponsible" className="text-xs font-medium text-gray-800 cursor-pointer">Exibir Selo/Assinatura Técnica</label>
                  </div>
                  <FormInput label="Nome do Responsável" name="techResponsibleName" value={data.techResponsibleName} onChange={handleChange} />
                  <FormInput label="Especialidades / Competências" name="techResponsibleCompetencies" value={data.techResponsibleCompetencies} onChange={handleChange} />
                </div>
              </section>
            </div>
          )}
          {activeTab === 'grade' && (
            <div className="animate-fadeIn space-y-6">
              <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-600 uppercase mb-4 flex items-center gap-2"><i className="fa-solid fa-sliders"></i> Configurações da Grade</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="showHoursColumn" name="showHoursColumn" checked={data.showHoursColumn} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
                    <label htmlFor="showHoursColumn" className="text-sm font-medium text-gray-800 cursor-pointer">Exibir coluna de horas</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1"><label className="text-xs font-bold text-gray-500 uppercase">Tam. Fonte Conteúdo</label><span className="text-xs font-mono font-bold text-blue-600">{data.versoCurriculumFontSize}px</span></div>
                      <input type="range" name="versoCurriculumFontSize" min="8" max="24" value={data.versoCurriculumFontSize} onChange={handleSliderChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1"><label className="text-xs font-bold text-gray-500 uppercase">Espaçamento Linhas</label><span className="text-xs font-mono font-bold text-blue-600">{data.versoRowPadding}px</span></div>
                      <input type="range" name="versoRowPadding" min="2" max="40" value={data.versoRowPadding} onChange={handleSliderChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>
                </div>
              </section>
              <CurriculumTable items={data.curriculum} totalHours={data.totalHours} showHoursColumn={data.showHoursColumn} onAdd={handleAddCurriculum} onRemove={handleRemoveCurriculum} onUpdate={handleUpdateCurriculum} onUpdateTotal={(val) => setData(prev => ({ ...prev, totalHours: val }))} />
            </div>
          )}
          {activeTab === 'visual' && (
            <div className="animate-fadeIn space-y-6">
              <section className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                <h3 className="text-xs font-bold text-blue-900 uppercase mb-4 flex items-center gap-2"><i className="fa-solid fa-ruler-combined"></i> Dimensões de Cabeçalho e Rodapé</h3>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                    <p className="text-[10px] font-bold text-blue-800 uppercase mb-3">FRENTE (Página 1)</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase text-blue-600">Altura Cabeçalho</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.frontHeaderPadding}px</span></div>
                        <input type="range" name="frontHeaderPadding" min="0" max="300" value={data.frontHeaderPadding} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase text-blue-600">Altura Rodapé</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.frontFooterPadding}px</span></div>
                        <input type="range" name="frontFooterPadding" min="0" max="250" value={data.frontFooterPadding} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Espaçamento Lateral</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.frontSidePadding}px</span></div>
                        <input type="range" name="frontSidePadding" min="20" max="250" value={data.frontSidePadding} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Espessura Borda</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.frontBorderWidth}px</span></div>
                        <input type="range" name="frontBorderWidth" min="0" max="60" value={data.frontBorderWidth} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                    <p className="text-[10px] font-bold text-blue-800 uppercase mb-3">VERSO (Página 2)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase text-blue-600">Altura Cabeçalho</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.versoHeaderPadding}px</span></div>
                        <input type="range" name="versoHeaderPadding" min="0" max="300" value={data.versoHeaderPadding} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase text-blue-600">Altura Rodapé</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.versoFooterPadding}px</span></div>
                        <input type="range" name="versoFooterPadding" min="0" max="250" value={data.versoFooterPadding} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-600 uppercase mb-4 flex items-center gap-2"><i className="fa-solid fa-up-down-left-right"></i> Ajustes de Posição (Layout)</h3>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
                    <p className="text-[10px] font-bold text-blue-900 uppercase">VERSO (Pág 2)</p>
                    <div>
                      <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Posição Vertical da Grade</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.versoCurriculumVerticalOffset}px</span></div>
                      <input type="range" name="versoCurriculumVerticalOffset" min="-200" max="200" value={data.versoCurriculumVerticalOffset} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Posição Vertical Instituição</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.versoInstitutionVerticalOffset}px</span></div>
                      <input type="range" name="versoInstitutionVerticalOffset" min="-200" max="200" value={data.versoInstitutionVerticalOffset} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
                    <p className="text-[10px] font-bold text-blue-900 uppercase">FRENTE (Pág 1)</p>
                    <div>
                      <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Posição Vertical Título</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.titleVerticalOffset}px</span></div>
                      <input type="range" name="titleVerticalOffset" min="-200" max="200" value={data.titleVerticalOffset} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Posição Vertical Assinaturas</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.signaturesVerticalOffset}px</span></div>
                      <input type="range" name="signaturesVerticalOffset" min="-200" max="200" value={data.signaturesVerticalOffset} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Alinhamento do Texto</label>
                      <div className="flex bg-gray-100 p-1 rounded-md border">
                        <button onClick={() => setTextAlign('left')} className={`flex-1 py-1.5 rounded transition-all ${data.frontTextAlign === 'left' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Esquerda"><i className="fa-solid fa-align-left"></i></button>
                        <button onClick={() => setTextAlign('center')} className={`flex-1 py-1.5 rounded transition-all ${data.frontTextAlign === 'center' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Centralizado"><i className="fa-solid fa-align-center"></i></button>
                        <button onClick={() => setTextAlign('right')} className={`flex-1 py-1.5 rounded transition-all ${data.frontTextAlign === 'right' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Direita"><i className="fa-solid fa-align-right"></i></button>
                        <button onClick={() => setTextAlign('justify')} className={`flex-1 py-1.5 rounded transition-all ${data.frontTextAlign === 'justify' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Justificado"><i className="fa-solid fa-align-justify"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SEÇÃO DE NEGRITO EM VARIÁVEIS */}
              <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-600 uppercase mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-bold"></i> Estilo de Texto (Destaque)
                </h3>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Negrito nas Variáveis Dinâmicas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableVariables.map((variable) => (
                      <div key={variable.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`bold-${variable.value}`}
                          checked={data.boldVariables.includes(variable.value)}
                          onChange={() => toggleBoldVariable(variable.value)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <label htmlFor={`bold-${variable.value}`} className="text-xs text-gray-700 cursor-pointer select-none">
                          {variable.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-600 uppercase mb-4 flex items-center gap-2"><i className="fa-solid fa-font"></i> Tamanhos de Fontes</h3>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
                    <p className="text-[10px] font-bold text-blue-900 uppercase">FRENTE</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Título</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.titleFontSize}px</span></div>
                        <input type="range" name="titleFontSize" min="20" max="150" value={data.titleFontSize} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Nome (Manuscrito)</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.highlightNameFontSize}px</span></div>
                        <input type="range" name="highlightNameFontSize" min="20" max="150" value={data.highlightNameFontSize} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
                    <p className="text-[10px] font-bold text-blue-900 uppercase">VERSO</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Cabeçalho</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.versoHeaderFontSize}px</span></div>
                        <input type="range" name="versoHeaderFontSize" min="10" max="40" value={data.versoHeaderFontSize} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Grade Curricular</label><span className="text-[10px] font-mono font-bold text-blue-600">{data.versoCurriculumFontSize}px</span></div>
                        <input type="range" name="versoCurriculumFontSize" min="8" max="24" value={data.versoCurriculumFontSize} onChange={handleSliderChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-600 uppercase flex items-center gap-2"><i className="fa-solid fa-image"></i> Ativos Visuais</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fundo (Pág 1)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'bgImage')} className="block w-full text-[11px] text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Assinatura Digital Principal</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'signatureImage')} className="block w-full text-[11px] text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Selo / Assinatura Técnica</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'digitalSeal')} className="block w-full text-[11px] text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  </div>
                </div>
              </section>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Certificado</label>
                <textarea ref={textareaRef} name="baseText" value={data.baseText} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm h-48 text-sm font-mono bg-white outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="mt-2 text-xs text-gray-500">💡 Dica: Use variáveis como {'{{NOME}}'}, {'{{CPF}}'}, {'{{CURSO}}'}, {'{{DATA}}'}, {'{{CARGA_HORARIA}}'}, {'{{RAZAO_SOCIAL}}'}, {'{{CNPJ}}'}, {'{{ENDERECO}}'}</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t bg-gray-50 flex flex-col gap-3 shrink-0 z-20">
          <button
            onClick={() => {
              const shouldClear = window.confirm('🗑️ Limpar todos os dados?\n\nIsso irá remover:\n• Todos os alunos\n• Configurações visuais\n• Grade curricular\n• Dados salvos\n\nEsta ação não pode ser desfeita!');
              if (shouldClear) {
                clearCertificateData();
                window.location.reload();
              }
            }}
            className="w-full bg-red-50 border border-red-300 text-red-600 font-bold py-2 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <i className="fa-solid fa-trash-can"></i> LIMPAR TUDO
          </button>
          <button onClick={() => setIsPreviewOpen(true)} disabled={data.students.length === 0} className="w-full bg-white border-2 border-blue-900 text-blue-900 font-bold py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            <i className="fa-solid fa-eye"></i> PRÉ-VISUALIZAR TUDO
          </button>
          <button onClick={exportAllToPDF} disabled={isGenerating || data.students.length === 0} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2">
            {isGenerating ? (<><i className="fa-solid fa-circle-notch animate-spin"></i> GERANDO...</>) : (<><i className="fa-solid fa-file-pdf"></i> EXPORTAR LOTE</>)}
          </button>
        </div>
      </div>

      <div className="w-full flex-grow flex flex-col items-center bg-gray-200 p-2 md:p-8 md:overflow-hidden no-print min-h-[500px] overflow-x-auto scrollbar-thin">
        <div className="mb-6 flex flex-col items-center gap-4 no-print sticky left-0 right-0 z-30 w-full max-w-full">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-white/90 backdrop-blur-md p-2 md:p-3 rounded-xl shadow-xl border border-white/20">
            <div className={`flex items-center gap-2 md:gap-3 bg-gray-50 px-2 md:px-3 py-1.5 rounded-lg border ${data.students.length === 0 ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <button disabled={currentStudentIdx === 0} onClick={() => setCurrentStudentIdx(prev => prev - 1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-white border rounded-full text-blue-900 hover:bg-blue-50 disabled:opacity-30"><i className="fa-solid fa-chevron-left text-xs"></i></button>
              <div className="text-[10px] md:text-xs font-bold text-blue-900 min-w-[100px] md:min-w-[150px] text-center">
                {data.students.length > 0 ? (<>Aluno {currentStudentIdx + 1} de {data.students.length}</>) : (<span className="text-gray-400 italic">Nenhum</span>)}
              </div>
              <button disabled={currentStudentIdx === data.students.length - 1 || data.students.length === 0} onClick={() => setCurrentStudentIdx(prev => prev + 1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-white border rounded-full text-blue-900 hover:bg-blue-50 disabled:opacity-30"><i className="fa-solid fa-chevron-right text-xs"></i></button>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1 border">
              <button onClick={() => setPreviewPage(1)} className={`px-2 md:px-4 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all ${previewPage === 1 ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500'}`}>FRENTE</button>
              <button onClick={() => setPreviewPage(2)} className={`px-2 md:px-4 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all ${previewPage === 2 ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500'}`}>VERSO</button>
            </div>
            <div className="flex items-center bg-blue-50 rounded-lg px-2 py-1 gap-2 border border-blue-100">
              <button
                onClick={() => setIsRotated(!isRotated)}
                className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border rounded-lg transition-all ${isRotated ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'}`}
                title="Girar View"
              >
                <i className="fa-solid fa-rotate text-sm md:text-lg"></i>
              </button>
              <button onClick={() => handleZoom(-0.1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white transition-all"><i className="fa-solid fa-magnifying-glass-minus text-sm md:text-lg"></i></button>
              <div className="flex flex-col items-center min-w-[50px] md:min-w-[60px] px-1"><span className="text-[8px] md:text-[10px] uppercase font-bold text-blue-400">Zoom</span><span className="text-xs md:text-sm font-bold text-blue-900">{Math.round(zoom * 100)}%</span></div>
              <button onClick={() => handleZoom(0.1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white transition-all"><i className="fa-solid fa-magnifying-glass-plus text-sm md:text-lg"></i></button>
            </div>
          </div>
        </div>

        {/* Botão Lateral para Toggle do Monitor (Apenas Mobile) */}
        <button
          onClick={() => setIsMonitorVisible(!isMonitorVisible)}
          className={`md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-blue-900 text-white p-2.5 rounded-r-2xl shadow-2xl transition-all duration-500 border-2 border-l-0 border-white/20 flex items-center justify-center ${isMonitorVisible ? 'bg-blue-600' : 'bg-blue-900 opacity-80'}`}
        >
          <div className="flex flex-col items-center gap-2">
            <i className={`fa-solid ${isMonitorVisible ? 'fa-eye-slash' : 'fa-video'} text-sm`}></i>
            <span className="[writing-mode:vertical-lr] text-[7px] font-black uppercase tracking-widest py-1">Monitor</span>
          </div>
        </button>

        {/* Monitor Flutuante Mobile Inteligente (Lado Oposto ao Scroll) */}
        {isMonitorVisible && (
          <div
            className={`md:hidden fixed z-[45] left-0 right-0 transition-all duration-500 pointer-events-none ${miniPreviewPos === 'bottom' ? 'bottom-24 animate-slideInUp' : 'top-32 animate-slideInDown'}`}
          >
            <div className="relative mx-auto flex flex-col items-center">
              <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl border-2 border-blue-900/40 shadow-2xl scale-[0.32] origin-center" style={{ width: '1123px', height: '794px' }}>
                <CertificatePreview data={data} student={previewPage === 1 ? currentStudent : null} page={previewPage} />
              </div>
              <div className="mt-[-250px] bg-blue-900/90 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-xl border border-white/20 backdrop-blur-sm flex items-center gap-2">
                <i className="fa-solid fa-tower-broadcast animate-pulse text-blue-400"></i>
                <span className="tracking-tighter uppercase">Monitor Ao Vivo</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMonitorVisible(false); }}
                  className="pointer-events-auto ml-2 bg-white/20 hover:bg-white/40 w-4 h-4 rounded-full flex items-center justify-center"
                >
                  <i className="fa-solid fa-xmark text-[8px]"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botão Flutuante Mobile (MODO RETRATO) */}
        <button
          onClick={() => { setIsPreviewOpen(true); setIsRotated(true); }}
          className="md:hidden fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-900 text-white rounded-full shadow-2xl flex flex-col items-center justify-center animate-bounce border-2 border-white"
          title="Ver em Modo Retrato"
        >
          <i className="fa-solid fa-mobile-screen text-xl mb-1"></i>
          <span className="text-[8px] font-bold uppercase text-center leading-[1] px-1">Retrato</span>
        </button>

        <div className="origin-top shadow-2xl transition-all duration-300 ease-out mb-24 inline-block" style={{ transform: `scale(${zoom}) ${isRotated ? 'rotate(90deg)' : ''}`, marginTop: '20px' }}>
          <CertificatePreview data={data} student={previewPage === 1 ? currentStudent : null} page={previewPage} />
        </div>

        <div className="absolute top-[-9999px] left-0 pointer-events-none" style={{ width: '10000px', height: '2000px', overflow: 'visible' }}>
          {data.students.map((student, idx) => (
            <div key={student.id} id={`export-p1-${student.id}`} style={{ width: '1123px', height: '794px', position: 'absolute', top: 0, left: `${idx * 1200}px`, backgroundColor: 'white' }}>
              <CertificatePreview data={data} student={student} page={1} />
            </div>
          ))}
          <div id="export-p2-generic" style={{ width: '1123px', height: '794px', position: 'absolute', top: '1000px', left: 0, backgroundColor: 'white' }}>
            <CertificatePreview data={data} student={null} page={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
