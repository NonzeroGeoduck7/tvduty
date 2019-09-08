// SeriesTable.js
import React, { Component } from 'react'
import SeriesList from './SeriesList'
export default class SeriesTable extends Component {
  state = {
    seriesList: [],
    inputs: [],
    newProduct: {
      title: '',
      nrOfEpisodes: 0
    }
  }

  componentDidMount() {
	  // Fetch the Series from the database
	  fetch('/.netlify/functions/seriesRead')
		.then(res => res.json())
		.then(response => {
		  console.log(response.msg)
		  const inputs = [...this.state.inputs],
				seriesList = response.data

		  seriesList.forEach(series => {
			const productProps = this.setProductProps(series)
			inputs.push(productProps)
		  })

		  this.setState({ 
			seriesList,
			inputs
		  })
		})
		.catch(err => console.log('Error retrieving products: ', err))
  }
  // ProductProps
  setProductProps = (product) => {
    const productProps = {}
    
    // Cycle through product props and exclude props we don't want shown in the table
    Object.keys(product).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        productProps[key] = product[key]
      }
    })
    
    return productProps
  }
  
  compareProductProps = (i) => {
    const product = this.state.seriesList[i],
          input = this.state.inputs[i]
    
    let compare = false
    
    // Cycle though product props and exclude important props from comparison
    Object.keys(product).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        if (product[key] !== input[key]) {
          // Found a difference between input and product
          compare = true
        }
      }
    })
    
    return compare
  }
  
  // Input handlers
  handleNewInputChange = (e) => {
    const newProduct = this.state.newProduct,
          title = e.target.title,
          value = e.target.type === 'number' ? parseInt(e.target.nrOfEpisodes) : e.target.nrOfEpisodes
    
    newProduct[title] = value
    
    this.setState({
      newProduct: newProduct
    })
  }
  
  handleInputChange = (e) => {
    const inputs = [...this.state.inputs],
          target = e.target,
          id = parseInt(target.dataset.id),
          name = target.name,
          value = target.value
    
    inputs[id][name] = value
    
    this.setState({
      inputs 
    })
  }
  
  // CRUD
  postAPI = (source, data) => {
    return fetch('/.netlify/functions/' + source, {
        method: 'post',
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .catch(err => err)
  }
  
  addNewSeries = () => {
	  
	  // move to /add
	  
	/*
    const newProduct = this.state.newProduct
    
    this.postAPI('seriesCreate', newProduct)
      .then(response => {
        console.log(response.msg)
      
        const product = response.data,
              seriesList = [...this.state.seriesList],
              inputs = [...this.state.inputs],
              newProduct = {
                title: '',
                nrOfEpisodes: 0
              },
              productProps = this.setProductProps(product)
        
        inputs.push(productProps)
        seriesList.push(product)
        
        this.setState({ 
          seriesList: seriesList,
          inputs: inputs,
          newProduct: newProduct
        })
      })
      .catch(err => console.log('Series.create API error: ', err))
	  */
  }
  
  handleUpdate = (e) => {
    const seriesList = [...this.state.seriesList],
          inputs = [...this.state.inputs],
          index = parseInt(e.target.dataset.id),
          productData = inputs[index],
          oid = this.state.series[index]._id
    
    // Set product id and product data as JSON string
    const data = JSON.stringify({ id: oid, series: productData })
    
    this.postAPI('seriesUpdate', data)
      .then(response => {
        console.log(response.msg)
        const product = response.data
        
        // Set updated product props
        inputs[index] = this.setProductProps(product)
        seriesList[index] = product
      
        this.setState({
          seriesList,
          inputs
        })
      })
      .catch(err => console.log('Product.delete API error: ', err))
  }
  
  handleDelete = (e) => {
    const index = parseInt(e.target.dataset.id),
          id = this.state.series[index]._id
    
    this.postAPI('productDelete', id)
      .then(response => {
        console.log(response.msg)
        
        const inputs = [...this.state.inputs],
              products = [...this.state.series]
        
        inputs.splice(index, 1)
        products.splice(index, 1)
      
        this.setState({ 
          products: products,
          inputs:inputs
        })
      })
      .catch(err => console.log('Product.delete API error: ', err))
  }
  
  render() {
    return (
	  <div>
		  <table>
		    <thead>
			  <tr>
			    <th>Series</th>
			  </tr>
		    </thead>
		    <tbody>
			  <SeriesList series={this.state.seriesList} />
			</tbody>
		  </table>
		  <a href="/add">
		  	<button onClick={this.addNewSeries}>&#43;</button>
		  </a>
		</div>
    )
  }
}