
# Style & Glow AI - Development Manual

This guide covers setting up your development environment for Android development using React, Vite, and Capacitor.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your machine:

1.  **Node.js** (LTS version recommended)
2.  **Android Studio** (Latest version)
3.  **Java Development Kit (JDK) 21**

### Setting Java 21 as Default

To ensure your system uses this version for building:

**Linux / macOS:**
Add the following to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):
```bash
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk" # Path may vary depending on install
export PATH="$JAVA_HOME/bin:$PATH"
```
Verify with `java -version`.

**Windows:**
Set the `JAVA_HOME` environment variable to your JDK 21 installation path via System Properties > Environment Variables.

## 2. Project Setup & Environment Variables

### Step 1: Install Dependencies
Run the following command in the project root:
```bash
npm install
```

### Step 2: Configure Environment Variables (.env)

The app requires specific keys to function. You will create a `.env` file in the project root.

#### **Quick Setup via Terminal**

You can run these commands directly in your code editor's terminal (VS Code, Terminal, etc.) to create the file. **Replace the placeholder text with your actual keys.**

```bash
# 1. Create the .env file in the root directory
touch .env

# 2. Add your keys (Copy-paste these lines one by one, replacing the values)

# Replace 'your_google_key' with your actual key
echo "API_KEY=your_google_key" >> .env 

# Replace 'your_cloud_name' with your actual Cloudinary cloud name
echo "CLOUDINARY_CLOUD_NAME=your_cloud_name" >> .env 

# Replace 'your_preset_name' with your actual unsigned preset name
echo "CLOUDINARY_UPLOAD_PRESET=your_preset_name" >> .env 
```

---

#### **Where to get these keys?**

**1. Google Gemini API Key (`API_KEY`)**
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Sign in with your Google Account.
3.  Click on the blue **"Get API key"** button on the top left.
4.  Click **"Create API key"**.
5.  Copy the key string starting with `AIza...`.

**2. Cloudinary Credentials**
*Since you have an account, follow these specific steps to get the correct values:*

**A. Cloud Name (`CLOUDINARY_CLOUD_NAME`)**
1.  Log in to your [Cloudinary Console](https://console.cloudinary.com/).
2.  Look at the **"Product Environment Credentials"** section at the top left of the Dashboard.
3.  Copy the value next to **Cloud Name** (e.g., `dx8f9s2...`).

**B. Upload Preset (`CLOUDINARY_UPLOAD_PRESET`)**
*Crucial: This enables uploading without exposing your secret admin API key.*
1.  In Cloudinary, click the **Settings (Gear Icon)** at the bottom left of the sidebar.
2.  Click the **Upload** tab in the settings menu.
3.  Scroll down to the **Upload presets** section.
4.  Click **Add upload preset**.
5.  **Setting Name:** Give it a name (e.g., `style_glow_upload`). This is the value you will copy.
6.  **Signing Mode:** Change this from "Signed" to **"Unsigned"**. (This is required for frontend-only uploads).
7.  Click **Save**.
8.  Copy the name of the preset you just created.

---
 
## 3. Building for Android

### Capacitor Initialization

1.  **Build the Web App:**
    ```bash
    npm run build
    ```
    This creates the `dist` folder.

2.  **Add Android Platform:**
    ```bash
    npx cap add android
    ```
    This creates the `android` folder containing the native project.

3.  **Sync Plugins & Assets:**
    Whenever you install new npm packages or update the build, run:
    ```bash
    npx cap sync
    ```

### Running the App

**Development (Browser)**
```bash
npm run dev
```

**Android Emulator / Device**
To open the project in Android Studio and run it:
```bash
npx cap open android
```
Once Android Studio opens:
1.  Allow Gradle sync to complete.
2.  Select a device/emulator.
3.  Click the green "Run" (Play) button.

## 4. Generating Signed APK for Release

To create a release build (APK or App Bundle) for the Play Store or manual installation:

1.  **Generate Keystore:**
    Run this command in your terminal to create a `.jks` file. Keep your password safe!
    
    ```bash
    keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
    ```
    
    *Follow the prompts to enter your details.*

2.  **Move Keystore:**
    Move `my-release-key.jks` into the `android/app/` directory.

3.  **Build Signed APK:**
    *   Open Android Studio (`npx cap open android`).
    *   Go to **Build > Generate Signed Bundle / APK**.
    *   Select **APK**.
    *   Choose your `my-release-key.jks` file, enter the alias and passwords.
    *   Select **Release** variant.
    *   Click **Finish**.

The APK will be generated in `android/app/release/`.

## 5. Troubleshooting

**"Cloudinary upload failed: Invalid Signature"**
*   **Cause:** You likely used a "Signed" upload preset or your API Secret.
*   **Fix:** Ensure `CLOUDINARY_UPLOAD_PRESET` is set to an **Unsigned** preset created in Cloudinary settings.

**"API Key is missing"**
*   **Cause:** The `.env` file might not be read correctly.
*   **Fix:** Restart the development server (`npm run dev`) after creating the `.env` file. Ensure the variable name is exactly `API_KEY`.
