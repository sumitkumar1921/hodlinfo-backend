const express = require('express')
const cors = require('cors')
const axios = require('axios')
const mongoose = require('mongoose')
const Ticker = require('./models/tickerModels.js')

const app = express()
const PORT = 8080

app.use(cors())
app.use(express.json())

async function connectDB(){
    await mongoose.connect('mongodb://localhost:27017/hodlinfo')
    console.log('Database Connected!')
}
connectDB()

async function storeResults(){
    try{

        const api_response = await axios.get('https://api.wazirx.com/api/v2/tickers')
        const api_result = api_response.data
        const all_values = Object.values(api_result)
        const values = all_values.slice(0, 10)
        const result = values.map((value)=>{
            return {name: value.name, last:value.last, buy:value.buy, sell: value.sell, volume:value.volume, base_unit:value.base_unit}
        })
        const tickers = await Ticker.find()
        if(tickers.length != 0){
            await Ticker.deleteMany()
        }
        await Ticker.create(result)
        console.log("Data added successfully")

    } catch(error){
        console.log(error)
        // res.status(500).json('Internal Server Error')

    }
}

storeResults()


app.get('/getTickers', async (req, res)=>{
    try{
        const tickers = await Ticker.find();
        res.status(200).json(tickers);
        
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
    
})



app.listen(PORT, ()=>{
    console.log('Server started at port ' + PORT)
})
