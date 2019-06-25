import React from 'react'
import './App.scss'
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts'
import { evaluate } from 'mathjs'

function Table(props) {
  return (
    <div className="Table">
      {
        props.data.map((column, index) => (
          <Column
            key={index}
            column={column}
            index={index}
            rowMax={props.rowMax}
            columnMax={props.columnMax}
            onChange={props.onChange}
            onKeyDown={props.onKeyDown}
            self={props.self}
          />
        ))
      }
    </div>
  )
}

function Column(props) {
  return (
    <div className="Column">
      {
        props.column.map((row, index) => (
          <Row
            key={index}
            cell={row}
            row={index}
            column={props.index}
            rowMax={props.rowMax}
            columnMax={props.columnMax}
            onChange={props.onChange}
            onKeyDown={props.onKeyDown}
            self={props.self}
          />
        ))
      }
    </div>
  )
}

function Row(props) {
  function computeClassNames() {
    let className = 'cell '

    if (props.row === 0) {
      className += 'first-row '
    }

    if (props.column === 0) {
      className += 'first-column '
    }

    if (props.row === props.rowMax - 1) {
      className += 'last-row '
    }

    if (props.column === props.columnMax - 1) {
      className += 'last-column '
    }

    return className
  }

  return (
    <div className="Row">
      <input
        className={computeClassNames()}
        key={`row${props.row}:column${props.column}`}
        ref={props.self[`myRef${props.row}${props.column}`]}
        type="text"
        value={props.cell}
        onChange={props.onChange.bind(this, props.row, props.column)}
        onKeyDown={props.onKeyDown.bind(this, props.row, props.column)}
      />
    </div>
  )
}

function Chart(props) {
  return (
    <LineChart
      width={props.width}
      height={props.height}
      data={props.data}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={props.graphKeys[0]} />
      <YAxis />
      <Tooltip />
      <Legend />
      {
        props.graphKeys.map((graphKey, index) => {
          if (index === 0) {
            return null
          }
          return (
            <Line key={index} type="monotone" dataKey={graphKey} stroke={props.strokeColors[index - 1]} />
          )
        })
      }
    </LineChart>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      table: [['x', 1, 2, 3, ''], ['x^2', 1, 4, 9, ''], ['10 * sin(x)', 8.414709848078965, 9.092974268256818, 1.4112000805986722, '']]
    }
    // Create a ref for every cell
    this.state.table.map((el1, column) => el1.map((el2, row) => {
      this[`myRef${row}${column}`] = React.createRef()
      return null
    }))
  }

  handleChangeCell = (row, column, evt) => {
    if (this.isDisabled(row, column)) {
      return
    }

    let tableDeepCopy = this.state.table.slice().map(x => x.slice())
    tableDeepCopy[column][row] = evt.target.value

    // If the value of a column header gets updated to a math expression, each value below gets updated accordingly
    if (row === 0) {
      const formula = evt.target.value

      tableDeepCopy[column] = tableDeepCopy[column].map((col, index) => {
        if (index === 0) {
          return col
        }
        const val = tableDeepCopy[0][index]
        return this.evaluateExpression(formula, val)
      })
    }
    else if (column === 0) {
      tableDeepCopy = tableDeepCopy.map((col, index) => {
        if (index === 0) {
          return col
        }

        let formula = null

        return col.map((cell, cellIndex) => {
          if (cellIndex === 0) {
            formula = cell
            return cell
          }
          else if (cellIndex === row) {
            return this.evaluateExpression(formula, evt.target.value)
          }

          return cell
        })
      })
    }

    this.setState({ table: tableDeepCopy })
  }

  handleKeyDown = (row, column, evt) => {
    if (
      evt.key === 'ArrowUp' ||
      evt.key === 'ArrowDown' ||
      evt.key === 'ArrowLeft' ||
      evt.key === 'ArrowRight' ||
      evt.key === 'Enter' ||
      evt.key === 'Tab'
    ) {
      evt.preventDefault()
    }
    else {
      return
    }

    let tableDeepCopy = this.state.table.slice().map(x => x.slice())
    const rowLength = this.state.table[0].length - 1
    const columnLength = this.state.table.length - 1

    if (evt.key === 'ArrowUp' && row > 0) {
      this[`myRef${row - 1}${column}`].current.focus()
      const isLastRowEmpty = !this.state.table.find(column => !!column[rowLength])

      if (isLastRowEmpty) {
        tableDeepCopy = tableDeepCopy.map(column => column.slice(0, -1))
        this.setState({ table: tableDeepCopy })
      }
    }
    else if (evt.key === 'ArrowDown' || evt.key === 'Enter') {
      // If pressing Down or Enter on the final row, create a new row (with refs) and draw focus on the cell below
      if (row === rowLength) {
        tableDeepCopy = tableDeepCopy.map((columnValue, columnIndex) => {
          this[`myRef${row + 1}${columnIndex}`] = React.createRef()
          return columnValue.concat('')
        })
        this.setState({ table: tableDeepCopy }, () => {
          this[`myRef${row + 1}${column}`].current.focus()
        })
      }
      else {
        this[`myRef${row + 1}${column}`].current.focus()
      }
    }
    else if (evt.key === 'ArrowLeft' && column > 0) {
      this[`myRef${row}${column - 1}`].current.focus()
      const isLastColumnEmpty = !this.state.table[columnLength].find(x => !!x)

      if (isLastColumnEmpty) {
        tableDeepCopy = tableDeepCopy.slice(0, -1)
        this.setState({ table: tableDeepCopy })
      }
    }
    else if (evt.key === 'ArrowRight' || evt.key === 'Tab') {
      // If pressing Right or Tab on the final column, create a new column (with refs) and draw focus on the right cell
      if (column === columnLength) {
        tableDeepCopy = tableDeepCopy.concat([Array(rowLength + 1).fill('')])
        tableDeepCopy[columnLength + 1].map((cellValue, cellIndex) => {
          this[`myRef${cellIndex}${columnLength + 1}`] = React.createRef()
          return null
        })
        this.setState({ table: tableDeepCopy }, () => {
          this[`myRef${row}${column + 1}`].current.focus()
        })
      }
      else {
        this[`myRef${row}${column + 1}`].current.focus()
      }
    }

    return
  }

  isDisabled = (row, column) => {
    // Boolean used to disable computed cells
    const firstCell = row === 0 && column === 0
    const computedCell = row > 0 && column > 0
    return firstCell || computedCell
  }

  evaluateExpression = (formula, value) => {
    // Given a math formula, replace all instances of the variable x with a numerical value, and evaluate it
    //console.log(formula)
    //console.log(value)
    try {
      const expression = formula.replace(/x/g, value)
      const result = evaluate(expression)
      return result || ''
    }
    catch (e) {
      return ''
    }
  }

  render() {
    const graphKeys = this.state.table.map(column => column[0])
    const columnLength = this.state.table.length - 1
    const nonEmptyRows = this.state.table[0].filter(cell => !!cell)
    const graphValues = [...new Array(nonEmptyRows.length)].map(() => { return {} })

    const strokeColors = [...new Array(columnLength + 1)].map((el, index) => {
      const baseColors = ['#8884d8', '#82ca9d', '#e91e63', '#00bcd4']
      return baseColors[index % baseColors.length]
    })

    // Iterate through the table cells to populate the graphValues array of objects
    this.state.table.map((column, columnIndex) => {
      column
        .filter(row => !!row)
        .map((row, rowIndex) => {
          if (rowIndex === 0) {
            return null
          }

          const currentKey = graphKeys[columnIndex]

          if (graphValues && graphValues[rowIndex]) {
            graphValues[rowIndex][currentKey] = row
          }

          return null
        })
      return null
    })

    return (
      <div className="App">
        <div className="container">
          <h1 className="title">Grapher</h1>

          <div className="flex-container">
            <div className="flex-item">
              <Table
                data={this.state.table}
                rowMax={this.state.table[0].length}
                columnMax={this.state.table.length}
                onChange={this.handleChangeCell}
                onKeyDown={this.handleKeyDown}
                self={this}
              />
            </div>

            <div className="flex-item">
              <Chart
                width={730}
                height={250}
                data={graphValues}
                graphKeys={graphKeys}
                strokeColors={strokeColors}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
