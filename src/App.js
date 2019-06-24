import React from 'react'
import './App.scss'

function Table(props) {
  return (
    <div className="Table">
      {
        props.data.map((column, index) => (
          <Column
            key={index}
            column={column}
            index={index}
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
  return (
    <div className="Row">
      <input
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

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      table: [['x', 1, 2, 3], ['sin(x)', 0.84, 0.91, 0.14]]
    }
    // Create a ref for every cell
    this.state.table.map((el1, column) => el1.map((el2, row) => {
      this[`myRef${row}${column}`] = React.createRef()
      return null
    }))
  }

  handleChangeCell = (row, column, evt) => {
    const tableDeepCopy = this.state.table.slice().map(x => x.slice())
    tableDeepCopy[column][row] = evt.target.value
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
    }
    else if (evt.key === 'ArrowDown' || evt.key === 'Enter') {
      // If pressing Down or Enter on the final row, create a new row (with refs) and draw focus on the cell below
      if (row === rowLength) {
        tableDeepCopy = tableDeepCopy.map((columnValue, columnIndex) => {
          this[`myRef${row + 1}${columnIndex}`] = React.createRef()
          return columnValue.concat('')
        })
        this.setState({table: tableDeepCopy}, () => {
          this[`myRef${row + 1}${column}`].current.focus()
        })
      }
      else {
        this[`myRef${row + 1}${column}`].current.focus()
      }
    }
    else if (evt.key === 'ArrowLeft' && column > 0) {
      this[`myRef${row}${column - 1}`].current.focus()
    }
    else if (evt.key === 'ArrowRight' || evt.key === 'Tab') {
      // If pressing Right or Tab on the final column, create a new column (with refs) and draw focus on the right cell
      if (column === columnLength) {
        tableDeepCopy = tableDeepCopy.concat([Array(rowLength + 1).fill('')])
        tableDeepCopy[columnLength + 1].map((cellValue, cellIndex) => {
          this[`myRef${cellIndex}${columnLength + 1}`] = React.createRef()
          return null
        })
        this.setState({table: tableDeepCopy}, () => {
          this[`myRef${row}${column + 1}`].current.focus()
        })
      }
      else {
        this[`myRef${row}${column + 1}`].current.focus()
      }
    }

    return
  }

  render() {
    return (
      <div className="App">
        <h1>Grapher</h1>
        
        <Table
          data={this.state.table}
          onChange={this.handleChangeCell}
          onKeyDown={this.handleKeyDown}
          self={this}
        />
      </div>
    )
  }
}

export default App
