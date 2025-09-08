// Video Configuration - Google Drive Links
// Replace the placeholder IDs with your actual Google Drive file IDs

export const VIDEO_CONFIG = {
  // Hero section background video
  onamBackground: {
    id: '12aInBqIz2pl-M7KlH1Rs7oofFvimE8ff', // Google Drive file ID
    url: 'https://drive.google.com/uc?export=download&id=12aInBqIz2pl-M7KlH1Rs7oofFvimE8ff'
  },
  
  // Main celebration video in VideoSection
  onamCelebration: {
    id: '164KEGi_Zxcr7ijwAj_U-KuH1yNC_o_gg', // Google Drive file ID
    url: 'https://drive.google.com/uc?export=download&id=164KEGi_Zxcr7ijwAj_U-KuH1yNC_o_gg'
  },
  
  // Sadya (traditional feast) video
  sadya: {
    id: '1yoD57JaOpnWN2N0GBx9CzGwAV3_Yrwbr', // Google Drive file ID
    url: 'https://drive.google.com/uc?export=download&id=1yoD57JaOpnWN2N0GBx9CzGwAV3_Yrwbr'
  }
}

// Helper function to get video URL by key
export const getVideoUrl = (videoKey) => {
  return VIDEO_CONFIG[videoKey]?.url || ''
}

// Helper function to get video ID by key
export const getVideoId = (videoKey) => {
  return VIDEO_CONFIG[videoKey]?.id || ''
}
