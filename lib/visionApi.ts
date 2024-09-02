const API_KEY = "AIzaSyC14Pfp0jAxQFPaT40dIYIe9rpMxqi5TKc";

export const analyzeImage = async (
  imageUri: string
): Promise<string | null> => {
  try {
    // console.log(imageUri);
    const base64Image = await getBase64FromUri(imageUri);
    const body = JSON.stringify({
      requests: [
        {
          image: { content: base64Image.split(",")[1] },
          features: [{ type: "TEXT_DETECTION" }],
        },
      ],
    });

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      { method: "POST", body, headers: { "Content-Type": "application/json" } }
    );

    const result = await response.json();
    // console.log(result);
    const detections = result.responses[0].textAnnotations;

    if (detections) {
      //   console.log("Text:");
      //   detections.forEach((text: any) => console.log(text.description));
      console.log(detections[0].description);
      return detections[0].description;
    } else {
      console.log("No text detected");
      return "No text detected";
    }
  } catch (error) {
    console.error("Error:", error);
    return "Error occurred during text extraction";
  }
};

async function getBase64FromUri(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
