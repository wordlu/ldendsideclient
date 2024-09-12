import { Vector2, WebGLRenderer } from 'three'

export default class SelectionHelper {
  public selectionBox
  public renderer
  private element: HTMLElement
  public startPoint: Vector2
  private pointTopLeft: Vector2
  private pointBottomRight: Vector2
  public isDown: boolean
  private bindPointerDown
  private bindPointerMove
  private bindPointerUp

  constructor(selectionBox: any, renderer: WebGLRenderer, cssText: string) {
    this.element = document.createElement('div')
    this.element.style.cssText = cssText
    this.element.style.pointerEvents = 'none'

    this.selectionBox = selectionBox
    this.renderer = renderer

    this.startPoint = new Vector2()
    this.pointTopLeft = new Vector2()
    this.pointBottomRight = new Vector2()

    this.isDown = false

    this.bindPointerDown = (event: PointerEvent) => this.pointerDown(event)
    this.bindPointerMove = (event: PointerEvent) => this.pointerMove(event)
    this.bindPointerUp = () => this.pointerUp()

    this.renderer.domElement.addEventListener('pointerdown', this.bindPointerDown)
    this.renderer.domElement.addEventListener('pointermove', this.bindPointerMove)
    this.renderer.domElement.addEventListener('pointerup', this.bindPointerUp)
  }

  pointerDown(event: PointerEvent) {
    if (this.selectionBox.enabled) {
      this.isDown = true
      this.onSelectStart(event)
    }
  }
  pointerMove(event: PointerEvent) {
    if (this.selectionBox.enabled) {
      if (this.isDown) {
        this.onSelectMove(event)
      }
    }
  }

  pointerUp() {
    if (this.selectionBox.enabled) {
      this.isDown = false
      this.onSelectOver()
    }
  }

  onSelectStart(event: PointerEvent) {
    this.renderer.domElement.parentElement?.appendChild(this.element)

    this.element.style.left = event.clientX + 'px'
    this.element.style.top = event.clientY + 'px'
    this.element.style.width = '0px'
    this.element.style.height = '0px'

    this.startPoint.x = event.clientX
    this.startPoint.y = event.clientY
  }

  onSelectMove(event: PointerEvent) {
    this.pointBottomRight.x = Math.max(this.startPoint.x, event.clientX)
    this.pointBottomRight.y = Math.max(this.startPoint.y, event.clientY)
    this.pointTopLeft.x = Math.min(this.startPoint.x, event.clientX)
    this.pointTopLeft.y = Math.min(this.startPoint.y, event.clientY)

    this.element.style.left = this.pointTopLeft.x + 'px'
    this.element.style.top = this.pointTopLeft.y + 'px'
    this.element.style.width = this.pointBottomRight.x - this.pointTopLeft.x + 'px'
    this.element.style.height = this.pointBottomRight.y - this.pointTopLeft.y + 'px'
  }
  onSelectOver() {
    this.element.parentElement?.removeChild(this.element)
  }
}
