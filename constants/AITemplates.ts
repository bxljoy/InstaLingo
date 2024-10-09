export const AITemplates = [
  {
    id: "document_analysis",
    name: "Document Analysis",
    prompt:
      "Analyze this document image and extract all text content including headings, body text, and footnotes. Provide a structured output of the extracted information.",
    useCase:
      "This can be used in applications requiring data extraction from scanned documents, such as converting printed reports into digital text for archiving.",
  },
  {
    id: "label_detection",
    name: "Label Detection",
    prompt:
      "This image shows a grocery item. Identify and list the product name, ingredients, and nutritional information visible on the label.",
    useCase:
      "Useful for apps designed to help users track dietary intake or for allergen alert systems.",
  },
  {
    id: "receipt_analysis",
    name: "Receipt Analysis",
    prompt:
      "Analyze this receipt image and extract the following information: total amount, tax paid, items purchased, and date of transaction. Present the information in a structured format.",
    useCase: "Useful for expense tracking apps and financial management tools.",
  },
  {
    id: "text_translation",
    name: "Text Translation",
    prompt:
      "Identify the language of the text in this image, then translate all visible text into English. Provide both the original text and its translation.",
    useCase:
      "Particularly helpful for travelers using translation apps to navigate non-native regions or for reading foreign language materials.",
  },
  {
    id: "real_estate_analysis",
    name: "Real Estate Analysis",
    prompt:
      "Analyze this image of a real estate property. Identify and list architectural features, and estimate approximate dimensions based on any visible markers or signage.",
    useCase:
      "Useful for real estate apps that provide quick estimates of property features or for construction sites to assess signage compliance.",
  },
  {
    id: "event_poster_extraction",
    name: "Poster Extraction",
    prompt:
      "Extract key information from this event poster image, including event name, date, time, venue, and ticketing details. Present the information in a structured format.",
    useCase:
      "Useful for event management apps or calendar scheduling tools to automatically populate event details.",
  },
  {
    id: "street_sign_interpretation",
    name: "Street Sign Interpretation",
    prompt:
      "Identify and interpret the text and symbols on this street sign image. Explain the meaning of the sign and any relevant traffic or navigation information it conveys.",
    useCase:
      "Can be integrated into navigation systems or augmented reality apps to help users understand their surroundings better.",
  },
  {
    id: "medical_imaging_text_extraction",
    name: "Medical Imaging",
    prompt:
      "Examine this medical imaging label (e.g., X-ray, MRI) and extract all visible text, including patient data, diagnostic information, and any annotations made by healthcare professionals. Present the information in a structured, easy-to-read format.",
    useCase:
      "Useful in health information systems to streamline data entry and patient management.",
  },
  {
    id: "fashion_tagging_description",
    name: "Fashion Tagging",
    prompt:
      "Analyze this fashion catalog image and extract text descriptions of the clothing items, including material, size, and care instructions. Also, provide a brief description of the item's style and appearance.",
    useCase:
      "Great for e-commerce platforms to automate product listing processes.",
  },
  {
    id: "book_page_ocr_accessibility",
    name: "Book OCR",
    prompt:
      "Convert all text in this book page image into a digital format, maintaining the original structure and formatting. Include descriptions of any images or diagrams on the page.",
    useCase:
      "Enhances accessibility for visually impaired users by providing them with a means to listen to printed materials.",
  },
  {
    id: "automated_news_clipping",
    name: "News Clipping",
    prompt:
      "Analyze this newspaper article image and extract the headline, author, publication date, and main text content. Summarize the key points of the article in 3-5 sentences.",
    useCase:
      "Can be used by media monitoring services to automate the collection and analysis of news content.",
  },
  {
    id: "handwritten_notes_identification",
    name: "Handwritten Identification",
    prompt:
      "Transcribe the handwritten notes in this image into typed text, maintaining the original structure and formatting as much as possible. If there are any diagrams or sketches, describe them briefly.",
    useCase:
      "Useful for students and professionals looking to digitize and organize handwritten meeting notes or lectures.",
  },
  {
    id: "scientific_chart_data_extraction",
    name: "Charts and Graphs",
    prompt:
      "Analyze this scientific chart or graph image. Extract the underlying data points, axis labels, legend information, and any textual descriptions. Provide a brief interpretation of the chart's main findings.",
    useCase:
      "Assists researchers and data analysts in digitizing and analyzing graphical data from print sources.",
  },
  {
    id: "language_learning_tool",
    name: "Language Learning Tool",
    prompt:
      "Identify the language of the text in this image. Then, provide a word-by-word translation to English, along with a natural English translation of the full text. If possible, explain any idiomatic expressions or cultural context.",
    useCase:
      "Useful in language learning apps to help users practice reading and understanding foreign texts.",
  },
  {
    id: "menu_item_details",
    name: "Menu Item Details",
    prompt:
      "Analyze this restaurant menu image. Extract and list all dish names, their descriptions, and prices. Categorize the items if the menu has sections (e.g., appetizers, main courses, desserts).",
    useCase:
      "Helps restaurant apps or dietary tracking apps to provide detailed menu information to users.",
  },
];
