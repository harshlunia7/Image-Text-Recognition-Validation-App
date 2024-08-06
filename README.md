# Image Text Recognition Validation App

## Overview

This application is designed to facilitate the validation of text recognition in images. It enables users to review images and their corresponding text labels, verify or correct the text, and record their responses. The app processes each image-text pair, provides interaction options, and updates the results in a JSON file.

## Features

1. **Image and Text Handling**: Given images and their corresponding labels in a text file.
2. **Interactive Validation**: 
   - Display each image and its associated text.
   - Ask if the user can recognize the text from the image.
   - If "Yes":
     - Ask if the recognized text matches the provided text.
       - Record responses as "correct" or "wrong" based on user feedback.
   - If "No":
     - Show the provided text and ask if the user can recognize the text now.
       - Record responses as "correct" or "illegible" based on user feedback.
3. **Batch Processing**: Process and update the JSON file for 5 image-text pairs at a time.
4. **Progress Tracking**: Display the total number of pairs and show the progress based on recorded responses.
5. **Data Management**: 
   - Maintain a backup of the JSON file.
   - Only display unprocessed image-text pairs, hiding those already reviewed.

## Setup

### Prerequisites

- Python 3.x
- Required Python libraries: Flask (for web server), other libraries as needed for handling JSON and file operations.

### Installation

1. Clone the repository:
   ```bash
   https://github.com/harshlunia7/Image-Text-Recognition-Validation-App.git
