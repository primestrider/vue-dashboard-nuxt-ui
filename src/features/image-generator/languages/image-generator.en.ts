export default {
  page_title: "Image generator",
  description: "Build placeholder images from DummyJSON and copy the link into your mockups.",

  presets: {
    label: "Size presets",
    avatar: "Avatar",
    thumbnail: "Thumbnail",
    banner: "Banner",
    social: "Social card",
  },

  form: {
    width: "Width (px)",
    height: "Height (px)",
    swap: "Swap width and height",
    text: "Text",
    text_hint: "Leave empty to show the dimensions",
    text_placeholder: "Hello world",
    font_family: "Font",
    font_size: "Font size",
    background: "Background",
    foreground: "Text color",
    pick_color: "Pick {name}",
    format: "Format",
    reset: "Reset",
  },

  preview: {
    label: "Preview",
    alt: "Generated placeholder image, {width} by {height} pixels",
    loading: "Rendering…",
    error: "DummyJSON couldn't render this image. Try a smaller size.",
    url: "Image URL",
    copy: "Copy URL",
    copied: "URL copied",
    open: "Open",
    download: "Download",
    download_failed: "Download failed",
  },
}
