# Atlas of Books - Language Map Explorer

An interactive web application developed in React + Vite that allows users to search for books and visualize, on a dynamic world map, the sovereign countries associated with the languages of the selected work.

This application consumes the:
1. **Open Library API** for rich book search results.
2. **REST Countries API** for language-to-country correlation.
3. **Leaflet & React Leaflet** for geospatial visualizations with customized layer styles.

---

I used the recommended Antigravity IDE, initially with Gemini 3.5, but later changed to Claude Sonnet 4.6 to correct a problem with the project's focus

The process was simple: I wrote a description of what I wanted based closely on the professor's directions, then asked the model to make a plan and think thoroughly about how to implement it.

After reviewing the proposal, I read some of the questions the model/agent raised and corrected a few concepts.

Next, I asked the model to build the solution step by step; this was not strictly followed, but the IDE’s standard configuration forces the model to request authorization for actions it can run, which helped me understand what was happening.

I tested the version, which was technically complete; however, it contained a conceptual error: the project listed all translations of the book instead of focusing on the original language. That behavior was visible in the prompt I had given and could have been avoided with more careful review.

I then requested a second plan focused on the book’s original language, while keeping the accidental translation listing as a secondary feature.

That second version whas pretty much what i expected

All of the use of the model was done in english.

The model quota was fully used, and a cooldown was applied almost immediately after the code completed.

---

## 🚀 Execution Instructions

To run the application locally on your machine, execute the following commands in the project directory:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Launch the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to the local address displayed in the terminal (typically `http://localhost:5173`).

---

## 🛠️ Design & Architectural Decisions

### 1. Project Scaffolding & Safekeeping
The project was initialized using `vite` scaffolding with the `react` (JavaScript) template. To preserve the existing git repository files (`.git` directory, etc.), the initial environment was created in a temporary directory and safely moved into the root workspace.

### 2. Language Code Translation (API Bridging)
Open Library searches return 3-letter bibliographic language codes conforming to ISO 639-2/B (e.g. `fre` for French, `ger` for German, `chi` for Chinese, `rum` for Romanian). However, the REST Countries API language lookup endpoint (`/lang/{lang}`) expects standard terminology ISO 639-3 codes (e.g. `fra` for French, `deu` for German, `zho` for Chinese, `ron` for Romanian). 
* **Solution:** An explicit dictionary mapper `LANGUAGE_CODE_MAP` was implemented in `src/services/api.js` to automatically bridge bibliographic codes into standard terminology queries, ensuring high query accuracy and preventing 404 response errors.

### 3. Leaflet Default Assets and Custom Marker Pins
Vite's default asset bundling hashes standard image files, which frequently breaks default Leaflet marker pin icons, resulting in empty console errors or missing markers.
* **Solution:** We bypassed default icon rendering entirely by implementing custom, pulsing HTML markers (`L.divIcon`) in `src/components/BookMap.jsx`. These markers embed the respective country's flag directly inside a glowing circular map pin, dramatically improving theme integration and visualization aesthetics.

### 4. Dynamic Map Zoom Control (Fit Bounds Controller)
When a book language is selected, the list of countries speaking it can range from a single country to dozens (e.g. Spanish, English). Since Leaflet's standard map container does not reactively re-center when child marker coordinate lists mutate:
* **Solution:** We built a sub-component `MapController` that hooks into the map context using `useMap()`. Upon state changes in the active country list, it computes the bounding box coordinates via `L.latLngBounds()` and triggers a smooth `.fitBounds()` transition to focus the map viewport automatically.

### 5. High-End Dark UI and Glassmorphic Theme
The application avoids basic colors and styling templates in favor of a sleek, dark dashboard layout:
* **Side Panel Layout:** Allows users to view search inputs and detailed book info on the left, keeping the map visible on the right. In portrait/mobile viewports, the layout stacks vertically.
* **CartoDB Dark Matter:** Utilizes dark-themed tile layers to match the premium dark theme.
* **Visual States & Skeletons:** Implemented custom skeletons (`SkeletonList`) to avoid structural layout shifts during queries, alongside clear, friendly illustrations for empty search outcomes, unavailable cover displays, and offline/network errors.
