// Chave para identificar os dados salvos pela nossa aplicação no navegador.
const STORAGE_KEY = 'prompts_storage'

// Estado carregar os prompts salvos e exibir.
const state = {
  prompts: [],
  selectedId: null,
  hasUnsavedChanges: false,
  showOnlyFavorites: false,
  viewMode: 'list', // 'list' ou 'card'
}

// Sistema de notificações toast
const toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container')
  },

  show(message, type = 'info', duration = 2500) {
    const toastEl = document.createElement('div')
    toastEl.className = `toast ${type}`

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    }

    toastEl.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-message">${message}</div>
    `

    this.container.appendChild(toastEl)

    setTimeout(() => {
      toastEl.classList.add('hiding')
      setTimeout(() => {
        toastEl.remove()
      }, 300)
    }, duration)
  },

  success(message) {
    this.show(message, 'success')
  },

  error(message) {
    this.show(message, 'error')
  },

  info(message) {
    this.show(message, 'info')
  },
}

// Sistema de Modal
const modal = {
  overlay: null,
  title: null,
  message: null,
  confirmBtn: null,
  cancelBtn: null,
  resolvePromise: null,

  init() {
    this.overlay = document.getElementById('modal-overlay')
    this.title = document.getElementById('modal-title')
    this.message = document.getElementById('modal-message')
    this.confirmBtn = document.getElementById('modal-confirm')
    this.cancelBtn = document.getElementById('modal-cancel')

    this.confirmBtn.addEventListener('click', () => this.confirm())
    this.cancelBtn.addEventListener('click', () => this.cancel())
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.cancel()
    })
  },

  show(title, message) {
    this.title.textContent = title
    this.message.textContent = message
    this.overlay.style.display = 'flex'

    return new Promise((resolve) => {
      this.resolvePromise = resolve
    })
  },

  confirm() {
    this.overlay.style.display = 'none'
    if (this.resolvePromise) this.resolvePromise(true)
  },

  cancel() {
    this.overlay.style.display = 'none'
    if (this.resolvePromise) this.resolvePromise(false)
  },
}

// Seletores dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById('prompt-title'),
  promptContent: document.getElementById('prompt-content'),
  titleWrapper: document.getElementById('title-wrapper'),
  contentWrapper: document.getElementById('content-wrapper'),
  btnOpen: document.getElementById('btn-open'),
  btnCollapse: document.getElementById('btn-collapse'),
  sidebar: document.querySelector('.sidebar'),
  btnSave: document.getElementById('btn-save'),
  list: document.getElementById('prompt-list'),
  search: document.getElementById('search-input'),
  btnNew: document.getElementById('btn-new'),
  btnCopy: document.getElementById('btn-copy'),
  charCount: document.getElementById('char-count'),
  unsavedIndicator: document.getElementById('unsaved-indicator'),
  promptsCount: document.getElementById('prompts-count'),
  btnFavorites: document.getElementById('btn-favorites'),
  sortSelect: document.getElementById('sort-select'),
  btnExport: document.getElementById('btn-export'),
  btnViewMode: document.getElementById('btn-view-mode'),
  tagInput: document.getElementById('tag-input'),
  btnAddTag: document.getElementById('btn-add-tag'),
  tagsList: document.getElementById('tags-list'),
  formattingToolbar: document.querySelector('.formatting-toolbar'),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle('is-empty', !hasText)
}

// Funções para abrir e fechar a sidebar
function openSidebar() {
  elements.sidebar.classList.add('open')
  elements.sidebar.classList.remove('collapsed')
}

function closeSidebar() {
  elements.sidebar.classList.remove('open')
  elements.sidebar.classList.add('collapsed')
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener('input', function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
    markAsUnsaved()
  })

  elements.promptContent.addEventListener('input', function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
    updateCharCount()
    markAsUnsaved()
  })
}

// Atualiza contador de caracteres
function updateCharCount() {
  const text = elements.promptContent.textContent.trim()
  const charCount = text.length
  const wordCount = text
    ? text.split(/\s+/).filter((w) => w.length > 0).length
    : 0

  elements.charCount.textContent = `${charCount} caracteres • ${wordCount} palavras`
}

// Marca como não salvo
function markAsUnsaved() {
  state.hasUnsavedChanges = true
  elements.unsavedIndicator.style.display = 'flex'
}

// Marca como salvo
function markAsSaved() {
  state.hasUnsavedChanges = false
  elements.unsavedIndicator.style.display = 'none'
}

// Atualiza contador de prompts
function updatePromptsCount() {
  const total = state.prompts.length
  const favorites = state.prompts.filter((p) => p.isFavorite).length

  if (state.showOnlyFavorites) {
    elements.promptsCount.textContent = `${favorites} favoritos`
  } else {
    elements.promptsCount.textContent = `${total} ${
      total === 1 ? 'prompt' : 'prompts'
    }`
  }
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    toast.error('Título e conteúdo não podem estar vazios.')
    return
  }

  const now = new Date().toISOString()

  if (state.selectedId) {
    // Editando um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)

    if (existingPrompt) {
      existingPrompt.title = title || 'Sem título'
      existingPrompt.content = content || 'Sem conteúdo'
      existingPrompt.updatedAt = now
    }
  } else {
    // Criando um novo prompt
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
      tags: [],
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    }

    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }

  renderList(elements.search.value)
  persist()
  markAsSaved()
  updatePromptsCount()
  toast.success('Prompt salvo com sucesso!')
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log('Erro ao salvar no localStorage:', error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch (error) {
    console.log('Erro ao carregar do localStorage:', error)
  }
}

function createPromptItem(prompt) {
  const tmp = document.createElement('div')
  tmp.innerHTML = prompt.content
  const isSelected = prompt.id === state.selectedId ? 'selected' : ''
  const favoriteClass = prompt.isFavorite ? 'active' : ''

  // Formatar data
  let dateText = ''
  if (prompt.updatedAt) {
    const date = new Date(prompt.updatedAt)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) dateText = 'agora'
    else if (diffMins < 60) dateText = `${diffMins}min atrás`
    else if (diffHours < 24) dateText = `${diffHours}h atrás`
    else if (diffDays < 7) dateText = `${diffDays}d atrás`
    else
      dateText = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      })
  }

  // Tags HTML
  const tagsHTML =
    prompt.tags && prompt.tags.length > 0
      ? `<div class="prompt-item-tags">${prompt.tags
          .map((tag, i) => `<span class="tag tag-small">${tag}</span>`)
          .join('')}</div>`
      : ''

  return `
      <li class="prompt-item ${isSelected}" data-id="${
    prompt.id
  }" data-action="select" draggable="true">
        <div class="prompt-item-content">
          <span class="prompt-item-title">${prompt.title}</span>
          <span class="prompt-item-description">${tmp.textContent}</span>
          ${tagsHTML}
          ${dateText ? `<span class="prompt-item-meta">${dateText}</span>` : ''}
        </div>

        <div class="prompt-item-actions">
          <button class="btn-icon btn-favorite ${favoriteClass}" title="Favoritar" data-action="favorite">
            ⭐
          </button>
          <button class="btn-icon btn-duplicate" title="Duplicar" data-action="duplicate">
            📋
          </button>
          <button class="btn-icon" title="Remover" data-action="remove">
            <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
          </button>
        </div>
    </li>
  `
}

function sortPrompts(prompts) {
  const sortType = elements.sortSelect.value
  const sorted = [...prompts]

  switch (sortType) {
    case 'manual':
      // Retorna na ordem original do array (permite drag and drop)
      return sorted
    case 'recent':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0)
        const dateB = new Date(b.updatedAt || b.createdAt || 0)
        return dateB - dateA
      })
    case 'oldest':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0)
        const dateB = new Date(b.updatedAt || b.createdAt || 0)
        return dateA - dateB
      })
    case 'a-z':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'z-a':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return sorted
  }
}

function renderList(filterText = '') {
  let filteredPrompts = state.prompts

  // Filtrar por favoritos se ativo
  if (state.showOnlyFavorites) {
    filteredPrompts = filteredPrompts.filter((p) => p.isFavorite)
  }

  // Filtrar por texto de busca (título E conteúdo)
  const searchTerm = filterText.toLowerCase().trim()
  if (searchTerm) {
    filteredPrompts = filteredPrompts.filter((prompt) => {
      const titleMatch = prompt.title.toLowerCase().includes(searchTerm)
      const contentMatch = prompt.content.toLowerCase().includes(searchTerm)
      return titleMatch || contentMatch
    })
  }

  // Ordenar prompts
  filteredPrompts = sortPrompts(filteredPrompts)

  // Renderizar
  const html = filteredPrompts.map((p) => createPromptItem(p)).join('')

  elements.list.innerHTML = html

  // Aplicar classe de visualização
  elements.list.className = `prompt-list ${state.viewMode}-view`

  setupDragAndDrop()
  updatePromptsCount()
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ''
  elements.promptContent.textContent = ''
  updateAllEditableStates()
  updateCharCount()
  markAsSaved()
  renderTags()
  elements.promptTitle.focus()
  renderList(elements.search.value)
}

function duplicatePrompt(id) {
  const original = state.prompts.find((p) => p.id === id)

  if (original) {
    const now = new Date().toISOString()
    const duplicate = {
      id: Date.now().toString(36),
      title: `${original.title} (cópia)`,
      content: original.content,
      tags: original.tags ? [...original.tags] : [],
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    }

    state.prompts.unshift(duplicate)
    persist()
    renderList(elements.search.value)
    toast.success('Prompt duplicado com sucesso!')
  }
}

function exportPrompts() {
  if (state.prompts.length === 0) {
    toast.error('Não há prompts para exportar.')
    return
  }

  const dataStr = JSON.stringify(state.prompts, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const date = new Date().toISOString().split('T')[0]
  link.download = `prompts-backup-${date}.json`
  link.href = url
  link.click()

  URL.revokeObjectURL(url)
  toast.success('Prompts exportados com sucesso!')
}

function toggleViewMode() {
  state.viewMode = state.viewMode === 'list' ? 'card' : 'list'

  // Atualizar ícone do botão
  elements.btnViewMode.textContent = state.viewMode === 'list' ? '⊞' : '☰'
  elements.btnViewMode.title =
    state.viewMode === 'list'
      ? 'Visualização em cards'
      : 'Visualização em lista'

  renderList(elements.search.value)
}

// Gerenciamento de Tags
function renderTags() {
  if (!state.selectedId) {
    elements.tagsList.innerHTML = ''
    return
  }

  const prompt = state.prompts.find((p) => p.id === state.selectedId)
  if (!prompt || !prompt.tags) {
    elements.tagsList.innerHTML = ''
    return
  }

  elements.tagsList.innerHTML = prompt.tags
    .map(
      (tag, index) => `
    <span class="tag">
      ${tag}
      <button class="tag-remove" data-tag-index="${index}">×</button>
    </span>
  `
    )
    .join('')
}

function addTag() {
  const tagValue = elements.tagInput.value.trim()

  if (!tagValue) return

  if (!state.selectedId) {
    toast.error('Selecione ou crie um prompt primeiro.')
    return
  }

  const prompt = state.prompts.find((p) => p.id === state.selectedId)
  if (!prompt) return

  // Inicializar tags se não existir
  if (!prompt.tags) prompt.tags = []

  // Verificar se tag já existe
  if (prompt.tags.includes(tagValue)) {
    toast.error('Esta tag já existe.')
    return
  }

  // Limitar a 5 tags
  if (prompt.tags.length >= 5) {
    toast.error('Máximo de 5 tags por prompt.')
    return
  }

  prompt.tags.push(tagValue)
  prompt.updatedAt = new Date().toISOString()

  persist()
  renderTags()
  renderList(elements.search.value)
  elements.tagInput.value = ''
  markAsUnsaved()
}

function removeTag(index) {
  if (!state.selectedId) return

  const prompt = state.prompts.find((p) => p.id === state.selectedId)
  if (!prompt || !prompt.tags) return

  prompt.tags.splice(index, 1)
  prompt.updatedAt = new Date().toISOString()

  persist()
  renderTags()
  renderList(elements.search.value)
  markAsUnsaved()
}

// Formatação de texto
function formatText(command) {
  document.execCommand(command, false, null)
  elements.promptContent.focus()
}

function formatCode() {
  const selection = window.getSelection()
  const selectedText = selection.toString()

  if (!selectedText) {
    toast.info('Selecione um texto para formatar como código.')
    return
  }

  const code = document.createElement('code')
  code.textContent = selectedText

  const range = selection.getRangeAt(0)
  range.deleteContents()
  range.insertNode(code)

  // Limpar seleção
  selection.removeAllRanges()
  elements.promptContent.focus()
}

function copySelected() {
  try {
    const content = elements.promptContent

    if (!navigator.clipboard) {
      toast.error('Clipboard API não suportada neste ambiente.')
      return
    }

    navigator.clipboard.writeText(content.innerText)

    toast.success('Conteúdo copiado para a área de transferência!')
  } catch (error) {
    toast.error('Erro ao copiar para a área de transferência.')
    console.log('Erro ao copiar para a área de transferência:', error)
  }
}

// Eventos
elements.btnSave.addEventListener('click', save)
elements.btnNew.addEventListener('click', newPrompt)
elements.btnCopy.addEventListener('click', copySelected)

elements.search.addEventListener('input', function (event) {
  renderList(event.target.value)
})

// Filtro de favoritos
elements.btnFavorites.addEventListener('click', function () {
  state.showOnlyFavorites = !state.showOnlyFavorites
  this.classList.toggle('active')
  renderList(elements.search.value)
})

// Ordenação
elements.sortSelect.addEventListener('change', function () {
  renderList(elements.search.value)
})

// Exportar
elements.btnExport.addEventListener('click', exportPrompts)

// Toggle visualização
elements.btnViewMode.addEventListener('click', toggleViewMode)

// Tags
elements.btnAddTag.addEventListener('click', addTag)

elements.tagInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  }
})

elements.tagsList.addEventListener('click', function (event) {
  const removeBtn = event.target.closest('.tag-remove')
  if (removeBtn) {
    const index = parseInt(removeBtn.getAttribute('data-tag-index'))
    removeTag(index)
  }
})

// Formatação de texto
elements.formattingToolbar.addEventListener('click', function (event) {
  const btn = event.target.closest('.format-btn')
  if (!btn) return

  event.preventDefault()
  const format = btn.getAttribute('data-format')

  if (format === 'code') {
    formatCode()
  } else {
    formatText(format)
  }
})

elements.list.addEventListener('click', function (event) {
  const favoriteBtn = event.target.closest("[data-action='favorite']")
  const duplicateBtn = event.target.closest("[data-action='duplicate']")
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest('[data-id]')

  if (!item) return

  const id = item.getAttribute('data-id')

  // Duplicar prompt
  if (duplicateBtn) {
    duplicatePrompt(id)
    return
  }

  // Toggle favorito
  if (favoriteBtn) {
    const prompt = state.prompts.find((p) => p.id === id)
    if (prompt) {
      prompt.isFavorite = !prompt.isFavorite
      persist()
      renderList(elements.search.value)
      toast.info(
        prompt.isFavorite
          ? 'Adicionado aos favoritos!'
          : 'Removido dos favoritos'
      )
    }
    return
  }

  if (removeBtn) {
    // Confirmação antes de remover
    const prompt = state.prompts.find((p) => p.id === id)

    modal
      .show(
        'Remover Prompt',
        `Tem certeza que deseja remover o prompt "${prompt?.title}"?`
      )
      .then((confirmed) => {
        if (confirmed) {
          state.prompts = state.prompts.filter((p) => p.id !== id)

          // Se o prompt removido era o selecionado, limpar seleção
          if (state.selectedId === id) {
            state.selectedId = null
            elements.promptTitle.textContent = ''
            elements.promptContent.textContent = ''
            updateAllEditableStates()
          }

          renderList(elements.search.value)
          persist()
          toast.success('Prompt removido com sucesso!')
        }
      })
    return
  }

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      state.selectedId = id
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
      updateCharCount()
      markAsSaved()
      renderTags()
      renderList(elements.search.value)
    }
  }
})

// Drag and Drop para reordenar prompts
let draggedElement = null
let draggedId = null

function setupDragAndDrop() {
  const items = elements.list.querySelectorAll('.prompt-item')

  items.forEach((item) => {
    item.addEventListener('dragstart', handleDragStart)
    item.addEventListener('dragover', handleDragOver)
    item.addEventListener('drop', handleDrop)
    item.addEventListener('dragend', handleDragEnd)
    item.addEventListener('dragleave', handleDragLeave)
  })
}

function handleDragStart(e) {
  // Não permitir arrastar se estiver clicando nos botões de ação
  if (
    e.target.closest('.prompt-item-actions') ||
    e.target.closest('.btn-icon') ||
    e.target.closest('.btn-favorite') ||
    e.target.closest('.btn-duplicate')
  ) {
    e.preventDefault()
    return
  }

  // Não permitir arrastar no modo card
  if (elements.list.classList.contains('card-view')) {
    e.preventDefault()
    return
  }

  // Não permitir arrastar se não estiver em ordem manual
  if (elements.sortSelect.value !== 'manual') {
    toast.error('Altere a ordenação para "Ordem manual" para reorganizar')
    e.preventDefault()
    return
  }

  draggedElement = this
  draggedId = this.getAttribute('data-id')
  this.classList.add('dragging')
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/html', this.innerHTML)
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault()
  }

  // Não permitir drop no modo card
  if (elements.list.classList.contains('card-view')) {
    return false
  }

  e.dataTransfer.dropEffect = 'move'

  if (this !== draggedElement) {
    this.classList.add('drag-over')
  }

  return false
}

function handleDragLeave(e) {
  this.classList.remove('drag-over')
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation()
  }

  this.classList.remove('drag-over')

  if (draggedElement !== this) {
    const draggedIndex = state.prompts.findIndex((p) => p.id === draggedId)
    const targetId = this.getAttribute('data-id')
    const targetIndex = state.prompts.findIndex((p) => p.id === targetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove o item da posição original
      const [draggedItem] = state.prompts.splice(draggedIndex, 1)
      // Insere na nova posição
      state.prompts.splice(targetIndex, 0, draggedItem)

      persist()
      renderList(elements.search.value)
    }
  }

  return false
}

function handleDragEnd(e) {
  this.classList.remove('dragging')

  const items = elements.list.querySelectorAll('.prompt-item')
  items.forEach((item) => {
    item.classList.remove('drag-over')
  })
}

// Atalhos de teclado
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function (event) {
    // Ctrl+S ou Cmd+S - Salvar
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      save()
      return
    }

    // Ctrl+N ou Cmd+N - Novo prompt
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault()
      newPrompt()
      return
    }

    // ESC - Fechar sidebar (mobile)
    if (event.key === 'Escape') {
      if (elements.sidebar.classList.contains('open')) {
        closeSidebar()
      }
      return
    }
  })
}

// Inicialização
function init() {
  toast.init()
  modal.init()
  load()
  renderList('')
  attachAllEditableHandlers()
  updateAllEditableStates()
  updateCharCount()
  updatePromptsCount()
  renderTags()
  setupKeyboardShortcuts()

  // Estado inicial: sidebar aberta (desktop) ou fechada (mobile)
  elements.sidebar.classList.remove('open')
  elements.sidebar.classList.remove('collapsed')

  // Eventos para abrir/fechar sidebar
  elements.btnOpen.addEventListener('click', openSidebar)
  elements.btnCollapse.addEventListener('click', closeSidebar)
}

// Executa a inicialização ao carregar o script
init()
