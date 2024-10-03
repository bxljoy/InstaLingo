# InstaLingo

InstaLingo is a mobile application that allows users to instantly translate text from images. It combines image recognition, text extraction, and translation capabilities to provide a seamless language learning experience.

## Features

- Image-to-text extraction using Google Cloud Vision API
- Text translation using Google Translate API
- Text-to-speech functionality for pronunciation practice
- User authentication and profile management
- Local and cloud-based storage of extracted texts
- Cross-platform support (iOS and Android)

## Technologies Used

- React Native with Expo
- Firebase (Authentication, Firestore)
- Google Cloud Vision API
- Google Translate API
- Google Text-to-Speech API
- SQLite for local storage
- NativeWind for styling

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Expo CLI
- Firebase account
- Google Cloud Platform account with Vision, Translate, and Text-to-Speech APIs enabled

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/instalingo.git
   cd instalingo
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```
   VISION_API_KEY=your_vision_api_key
   GOOGLE_TRANSLATE_API_KEY=your_translate_api_key
   GOOGLE_TTS_API_KEY=your_tts_api_key
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_APP_ID=your_firebase_app_id
   WEB_CLIENT_ID=your_google_web_client_id
   ```

4. Start the development server:
   ```
   expo start
   ```

## Building and Deploying

To build the app for production:

1. For iOS:

   ```
   eas build --platform ios
   ```

2. For Android:
   ```
   eas build --platform android
   ```

For more detailed instructions on deploying to app stores, refer to the [Expo documentation](https://docs.expo.dev/distribution/introduction/).

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/)
- [Google Cloud Platform](https://cloud.google.com/)
