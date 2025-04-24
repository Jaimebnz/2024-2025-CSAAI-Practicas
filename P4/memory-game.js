const selectors = {
    gridContainer: document.querySelector('.grid-container'),
    movimientos: document.querySelector('.movimientos'),
    timer: document.querySelector('.timer'),
    comenzar: document.getElementById('comenzar-btn'),
    reiniciar: document.getElementById('reiniciar-btn'),
    dimensionSelect: document.getElementById('dimension-select'),
    tablero: document.querySelector('.tablero'),
    win: document.querySelector('.win')
  }
  
  let state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null,
    dimension: 4
  }
  
  const emojis = ['🍎','🍌','🍉','🍇','🍒','🍍','🥝','🍑','🥭','🍓','🥥','🍋','🥑','🍆','🥕','🌽','🥔','🍄']
  
  const pickRandom = (array, count) => {
    const cloned = [...array]
    const result = []
  
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * cloned.length)
      result.push(cloned[index])
      cloned.splice(index, 1)
    }
  
    return result
  }
  
  const shuffle = array => {
    const cloned = [...array]
    for (let i = cloned.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cloned[i], cloned[j]] = [cloned[j], cloned[i]]
    }
    return cloned
  }
  
  const generateGame = () => {
    const dimension = state.dimension
    const picks = pickRandom(emojis, (dimension * dimension) / 2)
    const items = shuffle([...picks, ...picks])
  
    const tablero = document.createElement('div')
    tablero.className = 'tablero'
    tablero.style.gridTemplateColumns = `repeat(${dimension}, auto)`
    tablero.setAttribute('grid-dimension', dimension)
  
    items.forEach(item => {
      const card = document.createElement('div')
      card.className = 'card'
      card.innerHTML = `
        <div class="card-front"></div>
        <div class="card-back">${item}</div>
      `
      tablero.appendChild(card)
    })
  
    selectors.tablero.replaceWith(tablero)
    selectors.tablero = tablero
  }
  
  const startGame = () => {
    state = { ...state, gameStarted: true, flippedCards: 0, totalFlips: 0, totalTime: 0 }
    selectors.movimientos.innerText = `0 movimientos`
    selectors.timer.innerText = `tiempo: 0 sec`
    selectors.win.classList.remove('show')
    selectors.comenzar.classList.add('disabled')
    selectors.reiniciar.classList.remove('disabled')
    selectors.dimensionSelect.disabled = true
  
    state.loop = setInterval(() => {
      state.totalTime++
      selectors.timer.innerText = `tiempo: ${state.totalTime} sec`
    }, 1000)
  }
  
  const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
      card.classList.remove('flipped')
    })
    state.flippedCards = 0
  }
  
  const flipCard = card => {
    if (!state.gameStarted) startGame()
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return
  
    card.classList.add('flipped')
    state.flippedCards++
    state.totalFlips++
    selectors.movimientos.innerText = `${state.totalFlips} movimientos`
  
    if (state.flippedCards === 2) {
      const flipped = document.querySelectorAll('.card.flipped:not(.matched)')
      const [first, second] = flipped
  
      if (first.innerText === second.innerText) {
        first.classList.add('matched')
        second.classList.add('matched')
      }
  
      setTimeout(() => {
        flipBackCards()
        if (document.querySelectorAll('.card:not(.matched)').length === 0) {
          clearInterval(state.loop)
          selectors.win.innerHTML = `
            <div class="win-text">
              ¡Has ganado!<br />
              con <span class="highlight">${state.totalFlips}</span> movimientos<br />
              en <span class="highlight">${state.totalTime}</span> segundos
            </div>
          `
          selectors.win.classList.add('show')
        }
      }, 1000)
    }
  }
  
  selectors.dimensionSelect.addEventListener('change', e => {
    state.dimension = parseInt(e.target.value)
  })
  
  selectors.comenzar.addEventListener('click', () => {
    if (!selectors.comenzar.classList.contains('disabled')) {
      generateGame()
      startGame()
    }
  })
  
  selectors.reiniciar.addEventListener('click', () => {
    clearInterval(state.loop)
    state = { ...state, gameStarted: false, flippedCards: 0, totalFlips: 0, totalTime: 0 }
    selectors.comenzar.classList.remove('disabled')
    selectors.reiniciar.classList.add('disabled')
    selectors.dimensionSelect.disabled = false
    generateGame()
    selectors.movimientos.innerText = `0 movimientos`
    selectors.timer.innerText = `tiempo: 0 sec`
    selectors.win.classList.remove('show')
  })
  
  document.addEventListener('click', e => {
    if (e.target.closest('.card')) {
      flipCard(e.target.closest('.card'))
    }
  })
  
  // Inicial
  generateGame()
  