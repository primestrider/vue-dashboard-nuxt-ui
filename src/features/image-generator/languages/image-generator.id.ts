export default {
  page_title: "Generator gambar",
  description: "Buat gambar placeholder dari DummyJSON lalu salin tautannya ke mockup.",

  presets: {
    label: "Preset ukuran",
    avatar: "Avatar",
    thumbnail: "Thumbnail",
    banner: "Banner",
    social: "Kartu sosial",
  },

  form: {
    width: "Lebar (px)",
    height: "Tinggi (px)",
    swap: "Tukar lebar dan tinggi",
    text: "Teks",
    text_hint: "Kosongkan untuk menampilkan ukuran",
    text_placeholder: "Halo dunia",
    font_family: "Font",
    font_size: "Ukuran font",
    background: "Latar",
    foreground: "Warna teks",
    pick_color: "Pilih {name}",
    format: "Format",
    reset: "Atur ulang",
  },

  preview: {
    label: "Pratinjau",
    alt: "Gambar placeholder, {width} kali {height} piksel",
    loading: "Merender…",
    error: "DummyJSON tidak bisa merender gambar ini. Coba ukuran lebih kecil.",
    url: "URL gambar",
    copy: "Salin URL",
    copied: "URL disalin",
    open: "Buka",
    download: "Unduh",
    download_failed: "Unduhan gagal",
  },
}
