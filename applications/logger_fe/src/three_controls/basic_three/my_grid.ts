import { Object3D, GridHelper, Group } from 'three'
import SpriteText from 'three-spritetext'

/**
 * x-y 平面网格.
 */
export default class MyGrid extends Object3D {
  gridSize: number
  cellSize: number
  gridHelper: GridHelper
  grid: Group

  /**
   * 生成 x-y 平面网格.
   * @param gridSize 网格总长宽.
   * @param cellSize 单个网格长宽.
   */
  constructor(gridSize = 500, cellSize = 5) {
    super()

    this.gridSize = gridSize
    this.cellSize = cellSize
    // 添加网格
    const divisions = gridSize / cellSize
    this.gridHelper = new GridHelper(gridSize, divisions, 0xff0000, 0x550000)
    this.gridHelper.rotation.x = Math.PI / 2

    this.grid = new Group()
    this.grid.name = 'myGrid'
    this.grid.add(this.gridHelper)
    for (let i = -gridSize / 2; i <= gridSize / 2; i += cellSize) {
      let xLabel = null
      if (i === cellSize) {
        xLabel = new SpriteText('x', 1.5, '#f00')
      } else {
        xLabel = new SpriteText(i.toString(), 1)
      }
      xLabel.position.set(i, -1, 0)
      this.grid.add(xLabel)
    }
    for (let i = -gridSize / 2; i <= gridSize / 2; i += cellSize) {
      if (i === 0) {
        continue
      }
      let yLabel = null
      if (i === cellSize) {
        yLabel = new SpriteText('y', 1.5, '#0f0')
      } else {
        yLabel = new SpriteText(i.toString(), 1)
      }
      yLabel.position.set(-1, i, 0)
      this.grid.add(yLabel)
    }
    this.add(this.grid)
  }
}
