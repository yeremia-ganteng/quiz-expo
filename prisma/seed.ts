import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RawQuestion {
  category: string;
  text: string;
  options: string[];
  correctOption: string;
}

const QUESTIONS_PER_CATEGORY = 30;

const LD = 'Literasi Digital';
const PU = 'Pengetahuan Umum';
const TA = 'Teknologi & AI';

/**
 * Helper pembuat soal: jawaban benar + 3 pengecoh.
 * correctOption otomatis identik dengan salah satu opsi.
 */
function q(category: string, text: string, correct: string, wrong: [string, string, string]): RawQuestion {
  return { category, text, options: [correct, ...wrong], correctOption: correct };
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

/**
 * Validasi bank soal sebelum disimpan ke basis data.
 */
function validateQuestions(list: RawQuestion[]) {
  const perCategory = new Map<string, number>();
  const longestWarnings: string[] = [];

  list.forEach((item, idx) => {
    const label = `#${idx + 1} [${item.category}] ${item.text.slice(0, 50)}...`;

    if (item.options.length !== 4) throw new Error(`Opsi harus 4: ${label}`);
    if (new Set(item.options).size !== 4) throw new Error(`Ada opsi kembar: ${label}`);
    if (!item.options.includes(item.correctOption)) throw new Error(`correctOption tidak ada di opsi: ${label}`);

    perCategory.set(item.category, (perCategory.get(item.category) ?? 0) + 1);

    const maxLen = Math.max(...item.options.map((o) => o.length));
    const isUniqueLongest =
      item.correctOption.length === maxLen && item.options.filter((o) => o.length === maxLen).length === 1;
    if (isUniqueLongest && maxLen > 25) longestWarnings.push(label);
  });

  for (const [category, count] of perCategory) {
    if (count !== QUESTIONS_PER_CATEGORY) {
      throw new Error(`Kategori "${category}" berisi ${count} soal, seharusnya ${QUESTIONS_PER_CATEGORY}.`);
    }
  }

  if (longestWarnings.length > 0) {
    console.warn(`⚠️  ${longestWarnings.length} soal punya jawaban benar sebagai opsi terpanjang:`);
    longestWarnings.forEach((w) => console.warn('   -', w));
  }
}

// ==========================================
// DATA PERTANYAAN (30 SOAL PER KATEGORI)
// ==========================================

const RAW_QUESTIONS: RawQuestion[] = [
  // ---------------------------------------------------------------------------
  // LITERASI DIGITAL & KEAMANAN SIBER (30)
  // ---------------------------------------------------------------------------
  q(LD, 'Dalam arsitektur Zero Trust Network Access (ZTNA), prinsip dasar utama yang diterapkan pada setiap permintaan akses adalah...',
    'Never Trust, Always Verify',
    ['Trust Internal, Verify External', 'Verify Once, Trust Session Forever', 'Trust Devices Inside the Perimeter']),
  q(LD, 'Apa ancaman utama dari teknik serangan "Man-in-the-Middle" (MitM) pada penggunaan Wi-Fi publik tanpa proteksi VPN?',
    'Pencegatan dan manipulasi data saat sedang dikirim',
    ['Pencurian data dari perangkat yang sedang dimatikan', 'Penghapusan permanen riwayat peramban pengguna', 'Penyadapan data yang hanya terjadi pada kabel LAN']),
  q(LD, 'Jenis serangan rekayasa sosial di mana peretas menargetkan individu berpangkat tinggi (seperti CEO/CFO) dinamakan...',
    'Whaling',
    ['Spear Phishing', 'Pretexting', 'Baiting']),
  q(LD, 'Manakah deskripsi yang tepat mengenai perbedaan mendasar antara Symmetric dan Asymmetric Encryption?',
    'Simetris memakai satu kunci bersama, asimetris memakai pasangan kunci publik-privat',
    ['Simetris memakai pasangan kunci publik-privat, asimetris memakai satu kunci bersama', 'Simetris khusus untuk data teks, asimetris khusus untuk berkas biner', 'Simetris selalu lebih lambat dan lebih mudah dibobol daripada asimetris']),
  q(LD, 'Fungsi utama algoritma Hashing (seperti SHA-256) dalam mekanisme keamanan data adalah...',
    'Memverifikasi integritas data lewat fungsi satu arah',
    ['Menyandikan data agar dapat dikembalikan dengan kunci', 'Memampatkan data agar ukuran berkas menjadi kecil', 'Menyamarkan pesan di dalam berkas gambar atau audio']),
  q(LD, 'Apa yang dimaksud dengan "Cross-Site Scripting" (XSS) dalam konteks kerentanan aplikasi web?',
    'Menyisipkan skrip berbahaya yang berjalan di browser korban',
    ['Menyisipkan perintah SQL ke dalam kolom input basis data', 'Membanjiri server dengan permintaan palsu hingga lumpuh', 'Memalsukan permintaan sah atas nama pengguna yang login']),
  q(LD, 'Fitur "Perfect Forward Secrecy" (PFS) pada protokol TLS menjamin bahwa...',
    'Kunci sesi lama tetap aman walau kunci privat server bocor',
    ['Sertifikat server tidak akan pernah kedaluwarsa', 'Koneksi terputus otomatis pulih tanpa handshake ulang', 'Seluruh data terlindung dari serangan zero-day']),
  q(LD, 'Apa perbedaan utama antara Jejak Digital Pasif dan Aktif?',
    'Pasif terekam tanpa disadari, aktif dibuat sengaja oleh pengguna',
    ['Pasif dibuat sengaja oleh pengguna, aktif terekam otomatis', 'Pasif terhapus dalam 24 jam, aktif tersimpan selamanya', 'Pasif hanya ada di ponsel, aktif hanya di komputer desktop']),
  q(LD, 'Protokol DNSSEC (Domain Name System Security Extensions) dikembangkan khusus untuk mencegah ancaman...',
    'DNS spoofing dan cache poisoning',
    ['Serangan DDoS terhadap router', 'Brute force pada layanan SSH', 'Sniffing paket pada Wi-Fi terbuka']),
  q(LD, 'Dalam autentikasi modern, Physical Security Key (FIDO2/WebAuthn) dianggap paling tahan terhadap phishing karena...',
    'Kunci terikat pada domain asli sehingga situs palsu ditolak',
    ['Menghasilkan kata sandi acak sepanjang 128 karakter', 'Bekerja tanpa jaringan sehingga tidak bisa disadap', 'Memindai malware pada sistem operasi saat login']),
  q(LD, 'Ciri utama malware jenis ransomware adalah...',
    'Mengenkripsi data korban lalu meminta tebusan',
    ['Merekam ketikan korban secara diam-diam', 'Menyamar sebagai antivirus untuk memasang iklan', 'Menyebar lewat jaringan tanpa merusak berkas']),
  q(LD, 'Serangan SIM Swapping paling membahayakan metode autentikasi dua faktor berupa...',
    'Kode OTP yang dikirim lewat SMS',
    ['Kode TOTP dari aplikasi authenticator', 'Kunci keamanan fisik FIDO2', 'Sidik jari yang diverifikasi lokal di perangkat']),
  q(LD, 'Teknologi deepfake untuk memalsukan wajah atau suara umumnya memanfaatkan...',
    'Jaringan generatif seperti GAN',
    ['Algoritma kompresi gambar lossless', 'Protokol enkripsi ujung ke ujung', 'Pengurutan data berbasis pohon biner']),
  q(LD, 'Langkah paling tepat sebelum membagikan kabar viral yang mencurigakan adalah...',
    'Menelusuri sumber asli dan membandingkannya dengan media kredibel',
    ['Membagikannya ke grup keluarga agar ikut memeriksa', 'Mempercayainya bila sudah dibagikan banyak orang', 'Menilai kebenarannya dari seberapa meyakinkan foto pendampingnya']),
  q(LD, 'Ikon gembok pada bilah alamat browser menandakan bahwa...',
    'Koneksi terenkripsi, tetapi situsnya belum tentu tepercaya',
    ['Situs tersebut dijamin bebas dari malware dan penipuan', 'Identitas pemilik situs sudah diaudit oleh pemerintah', 'Perangkat pengguna otomatis kebal dari semua virus']),
  q(LD, 'Pertahanan paling efektif terhadap serangan SQL Injection pada aplikasi web adalah...',
    'Prepared statement dengan query berparameter',
    ['Menyembunyikan pesan error dari pengguna saja', 'Membatasi panjang kolom input menjadi 20 karakter', 'Mengganti port bawaan basis data']),
  q(LD, 'Pendaftaran domain yang ejaannya mirip situs resmi (misalnya "gooogle.com") untuk menjebak pengguna disebut...',
    'Typosquatting',
    ['Domain shadowing', 'DNS tunneling', 'Pharming']),
  q(LD, 'Kata sandi yang paling tahan terhadap serangan brute force umumnya adalah yang...',
    'Panjang dan acak, seperti passphrase beberapa kata',
    ['Pendek tetapi memakai banyak simbol khusus', 'Berupa tanggal lahir dengan huruf kapital di awal', 'Diganti tiap minggu dengan pola yang sama']),
  q(LD, 'Cookie pihak ketiga (third-party cookies) terutama dipakai untuk...',
    'Melacak perilaku pengguna lintas situs web',
    ['Menyimpan sesi login pada satu situs saja', 'Mempercepat proses booting perangkat', 'Menyimpan sertifikat enkripsi situs']),
  q(LD, 'Di Indonesia, pelindungan data pribadi diatur secara khusus oleh...',
    'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi',
    ['UU No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik', 'UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik', 'UU No. 36 Tahun 1999 tentang Telekomunikasi']),
  q(LD, 'Fungsi utama VPN bagi pengguna internet adalah...',
    'Mengenkripsi lalu lintas lewat terowongan ke server VPN',
    ['Menambah kecepatan dengan memperbesar bandwidth ISP', 'Membersihkan malware dari semua berkas unduhan', 'Membuat pengguna sepenuhnya anonim di internet']),
  q(LD, 'Aturan backup 3-2-1 berarti...',
    '3 salinan data, 2 jenis media, 1 salinan di luar lokasi',
    ['3 salinan data, 2 lokasi, 1 jenis media', '3 jenis media, 2 salinan data, 1 lokasi utama', '3 kali backup per hari, 2 per minggu, 1 per bulan']),
  q(LD, 'Seseorang yang mengikuti karyawan masuk ke area terbatas tanpa kartu akses sedang melakukan...',
    'Tailgating',
    ['Shoulder surfing', 'Dumpster diving', 'Eavesdropping']),
  q(LD, 'Cara paling tepat untuk memeriksa apakah foto viral pernah dipakai dalam konteks lain adalah...',
    'Pencarian gambar terbalik (reverse image search)',
    ['Memperbesar foto untuk mencari piksel yang janggal', 'Melihat jumlah suka dan komentar pada unggahan', 'Memeriksa ukuran berkas gambar tersebut']),
  q(LD, 'Kerentanan "zero-day" adalah...',
    'Celah yang belum diketahui vendor sehingga belum ada patch',
    ['Celah yang baru muncul tepat pada hari rilis perangkat lunak', 'Celah yang hanya bisa dieksploitasi pada tanggal tertentu', 'Celah yang sudah ditambal tetapi belum dipasang pengguna']),
  q(LD, 'Spyware jenis keylogger bekerja dengan cara...',
    'Merekam setiap ketikan pengguna secara diam-diam',
    ['Mengenkripsi seluruh berkas pada hard disk', 'Menampilkan iklan pop-up secara terus-menerus', 'Menggandakan diri melalui jaringan lokal']),
  q(LD, 'Tujuan penambahan "salt" pada proses hashing kata sandi adalah...',
    'Menggagalkan rainbow table dan hash kembar antarpengguna',
    ['Mempercepat proses verifikasi kata sandi saat login', 'Memungkinkan admin memulihkan kata sandi yang terlupa', 'Memperpendek ukuran hash yang disimpan di basis data']),
  q(LD, 'Ciri utama serangan DDoS dibanding DoS biasa adalah...',
    'Serangan berasal dari banyak perangkat tersebar (botnet)',
    ['Serangan hanya menargetkan basis data internal', 'Serangan selalu mengenkripsi data milik korban', 'Serangan dilakukan satu komputer berbandwidth besar']),
  q(LD, 'Menyebarkan data pribadi seseorang tanpa izin untuk mengintimidasi atau mempermalukannya disebut...',
    'Doxing',
    ['Catfishing', 'Trolling', 'Spoofing']),
  q(LD, 'Prinsip "least privilege" dalam keamanan informasi berarti...',
    'Hak akses dibatasi sebatas kebutuhan tugas pengguna',
    ['Semua pengguna diberi akses admin supaya pekerjaan lancar', 'Hak akses dicabut otomatis setiap akhir tahun anggaran', 'Hak akses ditentukan oleh lamanya masa kerja pegawai']),

  // ---------------------------------------------------------------------------
  // PENGETAHUAN UMUM, SEJARAH & GEOPOLITIK (30)
  // ---------------------------------------------------------------------------
  q(PU, 'Garis Wallace dan Garis Weber membagi wilayah persebaran fauna di Indonesia berdasarkan kriteria...',
    'Karakteristik fauna bertipe Asiatis, peralihan, dan Australis',
    ['Kedalaman palung laut dan batas zona ekonomi eksklusif', 'Ketinggian dataran tinggi di pulau-pulau utama', 'Curah hujan dan kelembapan vegetasi hutan']),
  q(PU, 'Organisasi pergerakan nasional "Indische Partij" yang didirikan oleh Tiga Serangkai dianggap radikal karena...',
    'Secara terbuka menuntut kemerdekaan Hindia Belanda',
    ['Memakai taktik perlawanan bersenjata sejak awal berdiri', 'Hanya menerima anggota dari kalangan bangsawan Jawa', 'Menjadikan agama sebagai satu-satunya asas perjuangan']),
  q(PU, 'Dampak geopolitik utama dari nasionalisasi Terusan Suez oleh Presiden Gamal Abdel Nasser pada 1956 adalah...',
    'Memicu Krisis Suez dan menguatkan Mesir sebagai pemimpin Non-Blok',
    ['Menutup jalur dagang Asia-Eropa selama puluhan tahun', 'Memicu pecahnya Perang Enam Hari di tahun yang sama', 'Membuat Mesir resmi bergabung dengan pakta NATO']),
  q(PU, 'Hukum Termodinamika II menyatakan konsep "Entropi", yang menjelaskan bahwa...',
    'Entropi total sistem terisolasi tidak pernah berkurang seiring waktu',
    ['Energi tidak dapat diciptakan maupun dimusnahkan', 'Entropi kristal murni menjadi nol pada suhu nol mutlak', 'Setiap aksi menimbulkan reaksi yang sama besar']),
  q(PU, 'Prinsip utama yang tertuang dalam Dasasila Bandung hasil Konferensi Asia-Afrika 1955 adalah...',
    'Penghormatan hak asasi manusia serta kedaulatan semua bangsa',
    ['Pembentukan pakta pertahanan bersama negara berkembang', 'Penerapan mata uang tunggal untuk kawasan Asia-Afrika', 'Penolakan seluruh investasi dari negara-negara Barat']),
  q(PU, 'Fenomena "Event Horizon" pada sebuah Lubang Hitam (Black Hole) didefinisikan sebagai...',
    'Batas tempat kecepatan lepas melampaui kecepatan cahaya',
    ['Titik pusat bermassa tak hingga di dalam lubang hitam', 'Cincin gas panas yang memancarkan sinar-X di sekitarnya', 'Semburan partikel berenergi tinggi dari kutub lubang hitam']),
  q(PU, 'Perjanjian Westphalia (1648) dianggap tonggak penting hubungan internasional modern karena...',
    'Melahirkan konsep kedaulatan negara-bangsa modern',
    ['Mengakhiri dominasi dagang rempah di Nusantara', 'Mendirikan Liga Bangsa-Bangsa sebagai penjaga perdamaian', 'Membagi wilayah jelajah dunia antara Spanyol dan Portugal']),
  q(PU, 'Unsur kimia manakah yang memiliki kelimpahan tertinggi di atmosfer bumi berdasarkan persentase volume?',
    'Nitrogen (±78%)',
    ['Oksigen (±21%)', 'Argon (±0,9%)', 'Karbon dioksida (±0,04%)']),
  q(PU, 'Karya sastra klasik "La Galigo" yang diakui UNESCO sebagai Memory of the World berasal dari tradisi suku...',
    'Bugis (Sulawesi Selatan)',
    ['Toraja (Sulawesi Selatan)', 'Makassar (Sulawesi Selatan)', 'Mandar (Sulawesi Barat)']),
  q(PU, 'Organisasi internasional yang memegang mandat utama dalam pengawasan tenaga atom dan nuklir dunia adalah...',
    'IAEA',
    ['OPCW', 'UNIDO', 'UNHCR']),
  q(PU, 'Negara pertama yang mengakui kemerdekaan Indonesia secara de jure adalah...',
    'Mesir',
    ['India', 'Australia', 'Burma']),
  q(PU, 'Sumpah Pemuda dicetuskan dalam...',
    'Kongres Pemuda II (1928)',
    ['Kongres Pemuda I (1926)', 'Kongres Perempuan I (1928)', 'Kongres Rakyat Indonesia (1939)']),
  q(PU, 'Garis khatulistiwa melintasi wilayah kota...',
    'Pontianak',
    ['Balikpapan', 'Palembang', 'Manado']),
  q(PU, 'Letusan dahsyat Gunung Krakatau yang menimbulkan tsunami besar terjadi pada tahun...',
    '1883',
    ['1815', '1902', '1963']),
  q(PU, 'Selat yang memisahkan Pulau Jawa dan Pulau Sumatra adalah...',
    'Selat Sunda',
    ['Selat Malaka', 'Selat Lombok', 'Selat Karimata']),
  q(PU, 'Klorofil pada daun tumbuhan menyerap cahaya paling sedikit pada warna...',
    'Hijau',
    ['Merah', 'Biru', 'Jingga']),
  q(PU, 'Jumlah partikel dalam satu mol zat (bilangan Avogadro) adalah sekitar...',
    '6,02 × 10²³',
    ['3,00 × 10⁸', '6,63 × 10⁻³⁴', '1,60 × 10⁻¹⁹']),
  q(PU, 'Organel sel yang berperan utama menghasilkan energi dalam bentuk ATP adalah...',
    'Mitokondria',
    ['Ribosom', 'Badan Golgi', 'Lisosom']),
  q(PU, 'Perang Diponegoro (Perang Jawa) berlangsung pada tahun...',
    '1825-1830',
    ['1803-1838', '1873-1904', '1859-1905']),
  q(PU, 'Konsep "soft power" dalam hubungan internasional dikemukakan oleh...',
    'Joseph Nye',
    ['Henry Kissinger', 'Samuel Huntington', 'Francis Fukuyama']),
  q(PU, 'Setelah Dekret Presiden 5 Juli 1959, sistem politik Indonesia memasuki masa...',
    'Demokrasi Terpimpin',
    ['Demokrasi Liberal', 'Demokrasi Parlementer', 'Demokrasi Pancasila']),
  q(PU, 'ASEAN didirikan pada 1967 melalui...',
    'Deklarasi Bangkok',
    ['Deklarasi Manila', 'Deklarasi Jakarta', 'Deklarasi Bali']),
  q(PU, 'Ibu kota negara Turki adalah...',
    'Ankara',
    ['Istanbul', 'Izmir', 'Bursa']),
  q(PU, 'Gurun terluas di dunia (jika gurun kutub dihitung) adalah...',
    'Antarktika',
    ['Sahara', 'Gobi', 'Arab']),
  q(PU, 'Planet dengan suhu permukaan terpanas di tata surya adalah...',
    'Venus',
    ['Merkurius', 'Mars', 'Jupiter']),
  q(PU, 'Cahaya Matahari membutuhkan waktu untuk sampai ke Bumi sekitar...',
    '8 menit',
    ['80 detik', '28 menit', '8 jam']),
  q(PU, 'Revolusi Industri pertama berawal dari negara...',
    'Inggris',
    ['Prancis', 'Jerman', 'Belanda']),
  q(PU, 'Peristiwa pertempuran 10 November 1945 di Surabaya diperingati setiap tahun sebagai Hari...',
    'Pahlawan',
    ['Kebangkitan Nasional', 'Sumpah Pemuda', 'Bela Negara']),
  q(PU, 'Candi Borobudur dibangun pada masa wangsa...',
    'Syailendra',
    ['Sanjaya', 'Isyana', 'Warmadewa']),
  q(PU, 'Tata nama binomial untuk penggolongan makhluk hidup dipopulerkan oleh...',
    'Carolus Linnaeus',
    ['Charles Darwin', 'Gregor Mendel', 'Aristoteles']),

  // ---------------------------------------------------------------------------
  // TEKNOLOGI INFORMATIKA & KECERDASAN BUATAN (30)
  // ---------------------------------------------------------------------------
  q(TA, 'Arsitektur "Transformer" dalam paper "Attention Is All You Need" (2017) mengandalkan mekanisme utama...',
    'Self-attention',
    ['Gerbang memori rekuren (LSTM)', 'Kernel konvolusi dengan stride', 'Proses keputusan Markov']),
  q(TA, 'Masalah "Vanishing Gradient" pada pelatihan Deep Neural Network dapat dikurangi dengan fungsi aktivasi...',
    'ReLU (Rectified Linear Unit)',
    ['Sigmoid logistik', 'Tanh (tangen hiperbolik)', 'Softmax']),
  q(TA, 'Fenomena "Hallucination" pada Large Language Model (LLM) merujuk pada kondisi di mana model...',
    'Menghasilkan jawaban meyakinkan tetapi keliru secara fakta',
    ['Kehabisan memori RAM saat memproses token panjang', 'Menolak menjawab pertanyaan yang melanggar kebijakan', 'Menyalin data latih persis tanpa perubahan']),
  q(TA, 'Dalam Reinforcement Learning, persamaan yang mendasari pembaruan nilai state-action (Q-value) adalah...',
    'Persamaan Bellman',
    ['Persamaan Euler-Lagrange', 'Persamaan Schrödinger', 'Transformasi Fourier']),
  q(TA, 'Teknik "Retrieval-Augmented Generation" (RAG) pada sistem LLM digunakan untuk...',
    'Mengambil dokumen eksternal sebagai konteks sebelum menjawab',
    ['Melatih ulang seluruh parameter model dari awal', 'Memangkas ukuran model agar muat di perangkat seluler', 'Menerjemahkan teks ke banyak bahasa sekaligus']),
  q(TA, 'Peran utama algoritma "Backpropagation" pada jaringan saraf tiruan adalah...',
    'Menghitung gradien loss terhadap bobot untuk memperbaruinya',
    ['Mengacak urutan data latih sebelum tiap epoch', 'Mengonversi data kategorikal menjadi vektor one-hot', 'Memampatkan matriks bobot agar hemat memori GPU']),
  q(TA, 'Keunggulan Edge Computing dibanding Cloud Computing terpusat pada aplikasi IoT industri adalah...',
    'Menurunkan latensi dan menghemat bandwidth ke cloud',
    ['Menghilangkan kebutuhan listrik di lokasi perangkat', 'Menyediakan penyimpanan tak terbatas di setiap sensor', 'Menjamin keamanan penuh dari serangan fisik']),
  q(TA, 'Fine-tuning efisien "LoRA" (Low-Rank Adaptation) pada model AI bekerja dengan cara...',
    'Membekukan bobot asli dan melatih adaptor berperingkat rendah',
    ['Membuang separuh neuron secara acak tiap iterasi latih', 'Menurunkan presisi bobot dari FP32 ke INT4 setelah latihan', 'Menggabungkan dua model berbeda menjadi satu arsitektur']),
  q(TA, 'Teorema CAP pada basis data terdistribusi menyatakan sistem hanya dapat menjamin maksimal 2 dari 3 properti, yaitu...',
    'Consistency, Availability, Partition Tolerance',
    ['Concurrency, Atomicity, Persistence', 'Capacity, Availability, Performance', 'Consistency, Atomicity, Durability']),
  q(TA, 'Istilah "Alignment Problem" dalam pengembangan AI tingkat lanjut mengacu pada tantangan...',
    'Memastikan tujuan dan perilaku AI sejalan dengan nilai manusia',
    ['Menyeimbangkan beban kerja CPU dan GPU pada klaster', 'Menyamakan format data teks dari berbagai bahasa', 'Menyesuaikan resolusi gambar dengan arsitektur CNN']),
  q(TA, 'Tanda utama model machine learning mengalami overfitting adalah...',
    'Akurasi latih tinggi, tetapi akurasi data uji jauh lebih rendah',
    ['Akurasi latih dan uji sama-sama rendah sejak awal', 'Akurasi uji selalu lebih tinggi daripada akurasi latih', 'Loss latih tidak berubah sejak epoch pertama']),
  q(TA, 'Dalam evaluasi klasifikasi, "recall" mengukur...',
    'Proporsi kasus positif sebenarnya yang berhasil terdeteksi',
    ['Proporsi prediksi positif yang ternyata benar', 'Proporsi seluruh prediksi yang benar', 'Proporsi kasus negatif yang salah dideteksi positif']),
  q(TA, 'Learning rate yang terlalu besar pada gradient descent dapat menyebabkan...',
    'Loss berosilasi atau divergen karena melompati titik minimum',
    ['Konvergensi lebih cepat tanpa risiko apa pun', 'Bobot menjadi nol di seluruh lapisan jaringan', 'Ukuran dataset latih berkurang secara otomatis']),
  q(TA, 'Lapisan pooling pada Convolutional Neural Network (CNN) berfungsi untuk...',
    'Mereduksi dimensi peta fitur dan menjaga fitur dominan',
    ['Menambah jumlah kanal warna pada gambar', 'Mengubah label kelas menjadi vektor probabilitas', 'Mengacak piksel agar model tidak menghafal data']),
  q(TA, 'Kompleksitas waktu algoritma binary search pada array terurut adalah...',
    'O(log n)',
    ['O(n)', 'O(n log n)', 'O(1)']),
  q(TA, 'Struktur data yang bekerja dengan prinsip LIFO (Last In, First Out) adalah...',
    'Tumpukan (stack)',
    ['Antrean (queue)', 'Senarai berantai (linked list)', 'Tabel hash (hash table)']),
  q(TA, 'Kode status HTTP 403 (Forbidden) berarti...',
    'Server memahami permintaan, tetapi menolak memberi akses',
    ['Sumber daya yang diminta tidak ditemukan di server', 'Terjadi kesalahan internal yang tidak terduga di server', 'Permintaan belum disertai kredensial autentikasi yang sah']),
  q(TA, 'Pada properti ACID transaksi basis data, huruf "I" merujuk pada...',
    'Isolation',
    ['Integrity', 'Indexing', 'Idempotence']),
  q(TA, 'Perintah Git untuk menyalin repositori jarak jauh ke komputer lokal adalah...',
    'git clone',
    ['git fork', 'git pull', 'git fetch']),
  q(TA, 'Protokol TCP bekerja pada lapisan model OSI ke...',
    'Lapisan transport (4)',
    ['Lapisan jaringan (3)', 'Lapisan sesi (5)', 'Lapisan aplikasi (7)']),
  q(TA, 'Qubit pada komputasi kuantum berbeda dari bit klasik karena dapat berada dalam...',
    'Superposisi dari keadaan 0 dan 1',
    ['Keadaan 0 dan 1 bergantian setiap detik', 'Tiga keadaan stabil: 0, 1, dan 2', 'Keadaan acak yang tidak dapat diukur']),
  q(TA, 'Mekanisme konsensus Proof of Work pada blockchain mengandalkan...',
    'Penyelesaian teka-teki komputasi untuk mengesahkan blok',
    ['Besarnya koin yang dikunci oleh validator', 'Penunjukan validator oleh satu otoritas pusat', 'Pemungutan suara terbuka seluruh pemilik koin']),
  q(TA, 'Menaikkan parameter "temperature" pada LLM umumnya membuat keluaran...',
    'Lebih beragam dan kurang dapat diprediksi',
    ['Selalu lebih akurat secara faktual', 'Otomatis menjadi lebih panjang', 'Identik pada setiap pengulangan']),
  q(TA, '"Context window" pada LLM adalah...',
    'Batas jumlah token yang dapat diproses sekaligus',
    ['Jumlah total parameter yang dimiliki model', 'Jumlah bahasa yang dapat dipahami model', 'Lama waktu yang dipakai untuk melatih model']),
  q(TA, 'Algoritma K-Means termasuk jenis pembelajaran...',
    'Tak terawasi (unsupervised) untuk klastering',
    ['Terawasi (supervised) untuk klasifikasi', 'Penguatan (reinforcement) untuk permainan', 'Terawasi (supervised) untuk regresi']),
  q(TA, 'Panjang alamat IPv6 adalah...',
    '128 bit',
    ['64 bit', '32 bit', '256 bit']),
  q(TA, 'Perbedaan utama container (Docker) dengan virtual machine adalah container...',
    'Berbagi kernel OS host sehingga lebih ringan',
    ['Menjalankan kernel sendiri di tiap instans', 'Selalu membutuhkan hypervisor tipe 1 untuk berjalan', 'Hanya dapat berjalan di sistem operasi Windows']),
  q(TA, 'Bias algoritmik pada sistem AI paling sering bersumber dari...',
    'Data latih yang tidak representatif atau penuh prasangka',
    ['Terlalu banyak data latih yang telah dibersihkan', 'Penggunaan GPU alih-alih CPU saat pelatihan', 'Kecepatan jaringan saat model diunduh']),
  q(TA, 'Pada Generative Adversarial Network (GAN), dua komponen yang saling bersaing adalah...',
    'Generator dan diskriminator',
    ['Encoder dan decoder', 'Agen dan lingkungan', 'Aktor dan kritikus']),
  q(TA, 'Tes Turing dirancang untuk menilai apakah sebuah mesin dapat...',
    'Berperilaku dalam percakapan tak terbedakan dari manusia',
    ['Menghitung lebih cepat daripada manusia', 'Memiliki kesadaran diri seperti manusia', 'Mengalahkan juara dunia catur']),
];

// ==========================================
// SEED EXECUTION ENGINE
// ==========================================

async function main() {
  console.log('🔍 Memvalidasi bank soal...');
  validateQuestions(RAW_QUESTIONS);
  console.log(`✅ Validasi lolos: ${RAW_QUESTIONS.length} soal.`);

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
  const preparedData = shuffledQuestions.map((item, index) => {
    // Acak urutan opsi jawaban A, B, C, D
    const shuffledOptions = shuffleArray(item.options);

    return {
      category: item.category,
      text: item.text,
      options: JSON.stringify(shuffledOptions),
      correctOption: item.correctOption,
      order: index + 1,
    };
  });

  console.log('💾 Menyimpan data pertanyaan baru ke basis data...');
  await prisma.question.createMany({
    data: preparedData,
  });

  console.log(`✨ Seed berhasil! Total ${preparedData.length} pertanyaan telah ditambahkan.`);
}

main()
  .catch((error) => {
    console.error('❌ Terjadi kesalahan saat melakukan seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });