# 📝 NLW Prompt Manager

A modern, lightweight prompt manager application built with vanilla JavaScript. Store, organize, and manage your AI prompts efficiently with a beautiful dark-themed interface.

## 🌟 Features

- **Create & Edit Prompts**: Write and save prompts with rich text formatting
- **Organization**: Tag your prompts for easy categorization
- **Search**: Quickly find prompts by title or content
- **Favorites**: Mark important prompts as favorites
- **Multiple Views**: Switch between list and card views
- **Export/Import**: Backup your prompts as JSON
- **Drag & Drop**: Reorder prompts manually
- **Rich Text Editor**: Format your prompts with bold, italic, lists, and code blocks
- **Dark Mode**: Beautiful dark-themed UI
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Live Demo

This application is deployed on GitHub Pages: [https://rafaeltmanso.github.io/nlw-prompt-manager/](https://rafaeltmanso.github.io/nlw-prompt-manager/)

## 💻 Technologies

- **HTML5**: Structure
- **CSS3**: Styling with custom properties (CSS variables)
- **JavaScript (ES6+)**: Application logic
- **LocalStorage**: Data persistence

## 🎨 Key Features Explained

### Prompt Management
- Create new prompts with titles and rich content
- Edit existing prompts with auto-save indicators
- Duplicate prompts to create variations
- Delete prompts with confirmation dialogs

### Organization & Search
- Add up to 5 tags per prompt for categorization
- Search across titles and content simultaneously
- Filter by favorites
- Sort by: manual order, most recent, oldest, A-Z, or Z-A

### Text Formatting
- **Bold** (Ctrl+B)
- *Italic* (Ctrl+I)
- <u>Underline</u> (Ctrl+U)
- Bulleted lists
- Numbered lists
- Inline code formatting
- Remove formatting option

### Keyboard Shortcuts
- `Ctrl+S` or `Cmd+S`: Save current prompt
- `Ctrl+N` or `Cmd+N`: Create new prompt
- `Esc`: Close sidebar (mobile)

## 📱 Usage

1. **Create a Prompt**: Click "Novo prompt" button
2. **Add Title**: Click on the title area and type
3. **Add Content**: Write your prompt content in the main editor
4. **Format Text**: Use the formatting toolbar to style your text
5. **Add Tags**: Use the tag input to categorize your prompt
6. **Save**: Click the "Salvar" button or press Ctrl+S
7. **Search**: Use the search bar to find specific prompts
8. **Organize**: Drag and drop prompts to reorder (in manual sort mode)

## 🛠️ Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/rafaeltmanso/nlw-prompt-manager.git
   ```

2. Navigate to the project directory:
   ```bash
   cd nlw-prompt-manager
   ```

3. Open `index.html` in your browser:
   ```bash
   # On macOS
   open index.html
   
   # On Linux
   xdg-open index.html
   
   # On Windows
   start index.html
   ```

   Or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   ```

4. Visit `http://localhost:8000` in your browser

## 📦 Data Storage

All prompts are stored locally in your browser's LocalStorage. Your data never leaves your device, ensuring complete privacy. To backup your prompts:

1. Click the export button (⬇️) in the sidebar
2. Save the JSON file to a safe location
3. To restore, you can import the JSON file back (feature to be implemented)

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the MIT License.

## 🎓 Credits

Built as part of NLW (Next Level Week) by Rocketseat.

---

Made with ❤️ by [Rafael Manso](https://github.com/rafaeltmanso)
