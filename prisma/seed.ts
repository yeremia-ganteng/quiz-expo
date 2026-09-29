import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RawQuestion {
  category: string;
  text: string;
  options: string[];
  correctOption: string;
}

/**
 * Algoritma Fisher-Yates Shuffle untuk mengacak array secara murni (Unbiased Randomization)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ==========================================
// DATA PERTANYAAN (TINGKAT KESULITAN TINGGI)
// ==========================================

const RAW_QUESTIONS: RawQuestion[] = [
  // ---------------------------------------------------------------------------
  // LITERASI DIGITAL & KEAMANAN SIBER
  // ---------------------------------------------------------------------------
  {
    category: 'Literasi Digital',
    text: 'Dalam arsitektur Zero Trust Network Access (ZTNA), prinsip dasar utama yang diterapkan pada setiap permintaan akses adalah...',
    options: [
      'Never Trust, Always Verify',
      'Trust Internal, Block External',
      'Verify Once, Trust Forever',
      'Implicit Trust via Perimeter Security',
    ],
    correctOption: 'Never Trust, Always Verify',
  },
  {
    category: 'Literasi Digital',
    text: 'Apa ancaman utama dari teknik serangan "Man-in-the-Middle" (MitM) pada penggunaan Wi-Fi publik tanpa proteksi VPN?',
    options: [
      'Pencegatan dan manipulasi lalu lintas data sensitif secara real-time',
      'Kerusakan fisik pada komponen modul Wi-Fi perangkat',
      'Penguraian otomatis password master pada password manager',
      'Peningkatan konsumsi daya baterai akibat paket data berlebih',
    ],
    correctOption: 'Pencegatan dan manipulasi lalu lintas data sensitif secara real-time',
  },
  {
    category: 'Literasi Digital',
    text: 'Jenis serangan rekayasa sosial di mana peretas menargetkan individu berpangkat tinggi (seperti CEO/CFO) dinamakan...',
    options: ['Whaling', 'Phishing', 'Smishing', 'Vishing'],
    correctOption: 'Whaling',
  },
  {
    category: 'Literasi Digital',
    text: 'Manakah deskripsi yang tepat mengenai perbedaan mendasar antara Symmmetric dan Asymmetric Encryption?',
    options: [
      'Sistem simetris menggunakan satu kunci untuk enkripsi/dekripsi, sedangkan asimetris menggunakan sepasang kunci (publik & privat)',
      'Sistem asimetris berjalan lebih cepat daripada sistem simetris pada data berukuran besar',
      'Sistem simetris membutuhkan Public Key Infrastructure (PKI) untuk verifikasi sertifikat',
      'Sistem asimetris tidak dapat digunakan pada protokol SSL/TLS modern',
    ],
    correctOption:
      'Sistem simetris menggunakan satu kunci untuk enkripsi/dekripsi, sedangkan asimetris menggunakan sepasang kunci (publik & privat)',
  },
  {
    category: 'Literasi Digital',
    text: 'Fungsi utama algoritma Hashing (seperti SHA-256) dalam mekanisme keamanan data adalah...',
    options: [
      'Memastikan integritas data melalui fungsi matematis satu arah (one-way)',
      'Mengompresi data berukuran besar agar efisien saat dikirim',
      'Mengenkripsi isi pesan agar bisa didekripsi kembali oleh penerima',
      'Menyembunyikan keberadaan file di dalam media gambar (Steganografi)',
    ],
    correctOption: 'Memastikan integritas data melalui fungsi matematis satu arah (one-way)',
  },
  {
    category: 'Literasi Digital',
    text: 'Apa yang dimaksud dengan "Cross-Site Scripting" (XSS) dalam konteks kerentanan aplikasi web?',
    options: [
      'Injeksi skrip berbahaya ke dalam situs web terpercaya yang dieksekusi di browser pengguna',
      'Penjelajahan basis data secara tak terotorisasi menggunakan klausa SQL',
      'Membuat server kewalahan dengan membanjiri paket request buatan',
      'Mengakses direktori terlarang pada web server secara langsung',
    ],
    correctOption: 'Injeksi skrip berbahaya ke dalam situs web terpercaya yang dieksekusi di browser pengguna',
  },
  {
    category: 'Literasi Digital',
    text: 'Fitur "Perfect Forward Secrecy" (PFS) pada protokol TLS menjamin bahwa...',
    options: [
      'Kunci sesi masa lalu tetap aman meskipun Private Key utama server bocor di masa depan',
      'Server tidak perlu melakukan handshaking ulang saat koneksi terputus',
      'Situs web terbebas dari ancaman kerentanan Zero-Day',
      'Setiap lalu lintas data tidak dapat di-cache oleh DNS server lokal',
    ],
    correctOption: 'Kunci sesi masa lalu tetap aman meskipun Private Key utama server bocor di masa depan',
  },
  {
    category: 'Literasi Digital',
    text: 'Apa perbedaan utama antara Jejak Digital Pasif dan Aktif?',
    options: [
      'Jejak pasif terekam tanpa kesadaran langsung pengguna (cth: IP/Geolocation), sedangkan aktif dibuat secara sengaja (cth: Unggahan)',
      'Jejak pasif terhapus otomatis setelah 24 jam, sedangkan jejak aktif tersimpan permanen',
      'Jejak pasif hanya berlaku di perangkat ponsel cerdas, sedangkan aktif di komputer Desktop',
      'Jejak pasif dienkripsi oleh ISP, sedangkan aktif dapat diakses secara publik',
    ],
    correctOption:
      'Jejak pasif terekam tanpa kesadaran langsung pengguna (cth: IP/Geolocation), sedangkan aktif dibuat secara sengaja (cth: Unggahan)',
  },
  {
    category: 'Literasi Digital',
    text: 'Protokol DNSSEC (Domain Name System Security Extensions) dikembangkan khusus untuk mencegah ancaman...',
    options: ['DNS Spoofing / Cache Poisoning', 'DDoS Attack pada Router', 'Brute Force Attack pada SSH', 'SQL Injection'],
    correctOption: 'DNS Spoofing / Cache Poisoning',
  },
  {
    category: 'Literasi Digital',
    text: 'Dalam konsep autentikasi modern, penggunaan Physical Security Key (FIDO2/WebAuthn) dianggap paling aman dari Phishing karena...',
    options: [
      'Menerapkan verifikasi Domain Binding (origin matching) berbasis hardware',
      'Dapat menghasilkan kata sandi sepanjang 128 karakter acak',
      'Tidak memerlukan jaringan internet saat proses verifikasi',
      'Dapat mendeteksi keberadaan virus pada sistem operasi',
    ],
    correctOption: 'Menerapkan verifikasi Domain Binding (origin matching) berbasis hardware',
  },

  // ---------------------------------------------------------------------------
  // PENGETAHUAN UMUM, SEJARAH & GEOPOLITIK
  // ---------------------------------------------------------------------------
  {
    category: 'Pengetahuan Umum',
    text: 'Garis Wallace dan Garis Weber membagi wilayah persebaran fauna di Indonesia berdasarkan kriteria...',
    options: [
      'Karakteristik Tipe Asiatis, Peralihan (Endemik), dan Australis',
      'Kedalaman palung laut dan zona ekonomi eksklusif (ZEE)',
      'Ketinggian dataran tinggi di pulau-pulau utama Indonesia',
      'Tingkat curah hujan dan kelembapan vegetasi hutan hujan',
    ],
    correctOption: 'Karakteristik Tipe Asiatis, Peralihan (Endemik), dan Australis',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Organisasi pergerakan nasional "Indische Partij" yang didirikan oleh Tiga Serangkai memiliki sifat radikal karena...',
    options: [
      'Secara terbuka menyuarakan gagasan kemerdekaan Hindia Belanda',
      'Menggunakan taktik perjuangan bersenjata secara langsung',
      'Hanya menerima anggota dari kalangan priyayi dan bangsawan',
      'Menolak bekerja sama dengan organisasi pemuda lokal',
    ],
    correctOption: 'Secara terbuka menyuarakan gagasan kemerdekaan Hindia Belanda',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Dampak geopolitik utama dari peristiwa Terusan Suez dinasionalisasi oleh Presiden Gamal Abdel Nasser pada 1956 adalah...',
    options: [
      'Memicu Krisis Suez dan menegaskan posisi Non-Blok Mesir dalam Perang Dingin',
      'Penutupan total jalur perdagangan antara Benua Asia dan Amerika',
      'Dimulainya Perang Dunia II di kawasan Timur Tengah',
      'Pembentukan organisasi perdagangan bebas Uni Eropa',
    ],
    correctOption: 'Memicu Krisis Suez dan menegaskan posisi Non-Blok Mesir dalam Perang Dingin',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Hukum Termodinamika II menyatakan konsep dasar mengenai "Entropi", yang menjelaskan bahwa...',
    options: [
      'Total entropi dari sistem terisolasi akan selalu meningkat seiring waktu',
      'Energi tidak dapat diciptakan maupun dimusnahkan',
      'Pada suhu nol mutlak, entropi suatu kristal murni menjadi nol',
      'Gaya aksi selalu menghasilkan gaya reaksi yang besarnya sama',
    ],
    correctOption: 'Total entropi dari sistem terisolasi akan selalu meningkat seiring waktu',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Prinsip utama yang tertuang dalam Piagam Dasasila Bandung hasil Konferensi Asia-Afrika 1955 adalah...',
    options: [
      'Penghormatan terhadap hak asasi manusia serta kedaulatan semua bangsa',
      'Pembentukan pakta pertahanan militer bersama antar-negara berkembang',
      'Penerapan mata uang tunggal untuk kawasan Asia Tenggara',
      'Penolakan terhadap investasi asing dari negara barat',
    ],
    correctOption: 'Penghormatan terhadap hak asasi manusia serta kedaulatan semua bangsa',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Fenomena astronomi "Event Horizon" pada sebuah Lubang Hitam (Black Hole) didefinisikan sebagai...',
    options: [
      'Batas di mana kecepatan lepas melebihi kecepatan cahaya sehingga materi tak bisa lolos',
      'Pusat gravitasi tak hingga di mana seluruh massa terkonsentrasi',
      'Cincin radiasi terang yang memancarkan sinar-X di sekitar lubang hitam',
      'Sisa ledakan supernova yang membeku di ruang hampa',
    ],
    correctOption: 'Batas di mana kecepatan lepas melebihi kecepatan cahaya sehingga materi tak bisa lolos',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Perjanjian Westphalia (1648) dianggap sebagai tonggak sejarah penting dalam hubungan internasional modern karena...',
    options: [
      'Melahirkan konsep kedaulatan negara-bangsa (nation-state sovereignty)',
      'Mengakhiri dominasi perdagangan rempah di Kepulauan Nusantara',
      'Membentuk Liga Bangsa-Bangsa sebagai lembaga perdamaian dunia',
      'Membagi wilayah penjelajahan dunia antara Spanyol dan Portugal',
    ],
    correctOption: 'Melahirkan konsep kedaulatan negara-bangsa (nation-state sovereignty)',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Unsur kimia manakah yang memiliki kelimpahan tertinggi di atmosfer bumi berdasarkan persentase volume?',
    options: ['Nitrogen (~78%)', 'Oksigen (~21%)', 'Argon (~0.9%)', 'Karbondioksida (~0.04%)'],
    correctOption: 'Nitrogen (~78%)',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Karya sastra klasik "La Galigo" yang diakui UNESCO sebagai Memory of the World berasal dari tradisi suku...',
    options: ['Bugis (Sulawesi Selatan)', 'Toraja (Sulawesi Selatan)', 'Minangkabau (Sumatra Barat)', 'Dayak (Kalimantan)'],
    correctOption: 'Bugis (Sulawesi Selatan)',
  },
  {
    category: 'Pengetahuan Umum',
    text: 'Organisasi internasional yang memegang mandat utama dalam pengawasan tenaga atom dan nuklir dunia adalah...',
    options: ['IAEA', 'UNICEF', 'UNHCR', 'UNIDO'],
    correctOption: 'IAEA',
  },

  // ---------------------------------------------------------------------------
  // TEKNOLOGI INFORMATIKA & KECERDASAN BUATAN (AI)
  // ---------------------------------------------------------------------------
  {
    category: 'Teknologi & AI',
    text: 'Arsitektur "Transformer" yang diperkenalkan dalam paper "Attention Is All You Need" (2017) mengandalkan mekanisme utama...',
    options: [
      'Self-Attention Mechanism',
      'Recurrent Gate Memory (LSTM)',
      'Convolutional Kernel Stride',
      'Markov Decision Process',
    ],
    correctOption: 'Self-Attention Mechanism',
  },
  {
    category: 'Teknologi & AI',
    text: 'Masalah "Vanishing Gradient" pada pelatihan Deep Neural Network dapat diatasi dengan menggunakan fungsi aktivasi...',
    options: ['ReLU (Rectified Linear Unit)', 'Sigmoid Standard', 'Tanh (Hyperbolic Tangent)', 'Step Function'],
    correctOption: 'ReLU (Rectified Linear Unit)',
  },
  {
    category: 'Teknologi & AI',
    text: 'Fenomena "Hallucination" pada Large Language Model (LLM) merujuk pada kondisi di mana model...',
    options: [
      'Menghasilkan respon yang terdengar meyakinkan secara tata bahasa namun secara faktual salah',
      'Mengalami kebocoran memori RAM akibat pemrosesan token berlebih',
      'Memprediksi kunci enkripsi basis data secara acak',
      'Menolak menjawab pertanyaan yang melanggar kebijakan etika',
    ],
    correctOption: 'Menghasilkan respon yang terdengar meyakinkan secara tata bahasa namun secara faktual salah',
  },
  {
    category: 'Teknologi & AI',
    text: 'Dalam pembelajaran penguatan (Reinforcement Learning), persamaan yang digunakan untuk memperbarui nilai state-action (Q-value) adalah...',
    options: ['Bellman Equation', 'Euler-Lagrange Equation', 'Navier-Stokes Equation', 'Fourier Transform'],
    correctOption: 'Bellman Equation',
  },
  {
    category: 'Teknologi & AI',
    text: 'Teknik "Retrieval-Augmented Generation" (RAG) pada sistem LLM digunakan untuk...',
    options: [
      'Menghubungkan LLM dengan basis data eksternal/vektor untuk memberikan fakta terkini & relevan',
      'Mengurangi bobot ukuran model agar dapat berjalan di perangkat mobile',
      'Melatih ulang (retrain) seluruh parameter model dari awal',
      'Mengkonversi teks menjadi sintesis audio secara cepat',
    ],
    correctOption: 'Menghubungkan LLM dengan basis data eksternal/vektor untuk memberikan fakta terkini & relevan',
  },
  {
    category: 'Teknologi & AI',
    text: 'Apa peran utama dari algoritma "Backpropagation" pada jaringan saraf tiruan (Artificial Neural Network)?',
    options: [
      'Menghitung gradien dari fungsi kerugian (loss function) untuk memperbarui bobot (weights)',
      'Mengacak urutan dataset input sebelum proses training dimulai',
      'Mengompresi matriks bobot agar menghemat ruang GPU',
      'Mengubah data kategorikal menjadi representasi One-Hot Vector',
    ],
    correctOption: 'Menghitung gradien dari fungsi kerugian (loss function) untuk memperbarui bobot (weights)',
  },
  {
    category: 'Teknologi & AI',
    text: 'Apa keunggulan arsitektur Edge Computing dibanding Cloud Computing terpusat pada aplikasi IoT industri?',
    options: [
      'Mengurangi latensi pemrosesan dan menghemat konsumsi bandwidth jaringan',
      'Menghilangkan kebutuhan akan daya listrik lokal',
      'Menyediakan kapasitas penyimpanan tak terbatas',
      'Menggaransi 100% keamanan dari serangan malware fisik',
    ],
    correctOption: 'Mengurangi latensi pemrosesan dan menghemat konsumsi bandwidth jaringan',
  },
  {
    category: 'Teknologi & AI',
    text: 'Proses fine-tuning efisien "LoRA" (Low-Rank Adaptation) pada model AI bekerja dengan cara...',
    options: [
      'Membekukan bobot asli model dan menyisipkan matriks dekomposisi berperingkat rendah',
      'Menghapus 50% neuron acak selama masa iterasi pelatihan',
      'Mengubah presisi bobot dari FP32 langsung ke INT4 tanpa analisis kerugian',
      'Menggabungkan dua arsitektur LLM yang berbeda menjadi satu',
    ],
    correctOption: 'Membekukan bobot asli model dan menyisipkan matriks dekomposisi berperingkat rendah',
  },
  {
    category: 'Teknologi & AI',
    text: 'Dalam sistem database terdistribusi, teorema CAP menyatakan bahwa sebuah sistem hanya dapat menjamin maksimal 2 dari 3 properti, yaitu...',
    options: [
      'Consistency, Availability, dan Partition Tolerance',
      'Concurrency, Authenticity, dan Privacy',
      'Capacity, Agility, dan Performance',
      'Control, Auditability, dan Protection',
    ],
    correctOption: 'Consistency, Availability, dan Partition Tolerance',
  },
  {
    category: 'Teknologi & AI',
    text: 'Istilah "Alignment Problem" dalam pengembangan Kecerdasan Buatan Tingkat Lanjut (AGI) mengacu pada tantangan...',
    options: [
      'Memastikan tujuan dan perilaku AI selaras dengan nilai serta intesi keselamatan manusia',
      'Menyeimbangkan kecepatan pemrosesan CPU dan GPU pada kluster server',
      'Menyelaraskan format format data teks dari berbagai bahasa di dunia',
      'Memastikan resolusi input gambar sesuai dengan arsitektur CNN',
    ],
    correctOption: 'Memastikan tujuan dan perilaku AI selaras dengan nilai serta intesi keselamatan manusia',
  },
];

// ==========================================
// SEED EXECUTION ENGINE
// ==========================================

async function main() {
  console.log('🔄 Memulai proses pembersihan basis data...');

  // Reset tabel relasi dan utama
  await prisma.response.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.question.deleteMany();

  console.log('✅ Pembersihan selesai.');
  console.log('🎲 Memproses pengacakan soal dan pilihan jawaban...');

  // Acak urutan pertanyaan secara global
  const shuffledQuestions = shuffleArray(RAW_QUESTIONS);

  // Mappers data dengan acakan opsi jawaban internal
  const preparedData = shuffledQuestions.map((q, index) => {
    // Acak urutan opsi jawaban A, B, C, D
    const shuffledOptions = shuffleArray(q.options);

    return {
      category: q.category,
      text: q.text,
      options: JSON.stringify(shuffledOptions),
      correctOption: q.correctOption,
      order: index + 1,
    };
  });

  console.log('💾 Menyimpan data pertanyaan baru ke basis data...');
  await prisma.question.createMany({
    data: preparedData,
  });

  console.log(`✨ Seed berhasil! Total ${preparedData.length} pertanyaan tingkat lanjut telah ditambahkan.`);
}

main()
  .catch((error) => {
    console.error('❌ Terjadi kesalahan saat melakukan seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });