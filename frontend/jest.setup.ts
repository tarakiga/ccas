import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8000/ws'
process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true'

// Mock canvas for lottie-web
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillStyle: '',
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
})) as any

// Mock lottie-react
jest.mock('lottie-react', () => ({
  __esModule: true,
  default: () => null,
}))

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      div: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
      button: React.forwardRef((props: any, ref: any) => React.createElement('button', { ...props, ref })),
      span: React.forwardRef((props: any, ref: any) => React.createElement('span', { ...props, ref })),
    },
    AnimatePresence: ({ children }: any) => children,
  }
})
