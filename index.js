//imports
import * as fs from "fs"
import minimist from "minimist"
import * as readline from "readline"
import * as path from "path"
import { Stream, Transform, pipeline } from "stream"

//constants and variables
const argv = minimist(process.argv.slice(2))
const source = argv["src"]
const delimeter = argv["delim"]

let result = {}

//Rean and Write Streams
const readStream = fs.createReadStream(path.join(process.cwd(), source))
const writeStream = fs.createWriteStream(path.join(process.cwd(), "output.txt"))

//Transform streams
const toString = new Transform({
  readableObjectMode:true,
  transform(chunk, encoding, callback){callback(null, chunk.toString().split(delimeter))}})

const sortAndProcess = new Transform({
  objectMode:true,
  transform(chunk, encoding, callback){callback(null, chunk.map(element => element.trim().replace(/[^\w\s\']/g,"")).sort())}})

const resultData = new Transform({
  objectMode:true,
  transform(chunk, encoding, callback){
    chunk.forEach(element => {
      if(result.hasOwnProperty(element)){
        result[element] = result[element]+1
      } else{
        //Uncomment to see intermediate result
        //console.log(result) 
        result[element] = 1
      }
    })

    result = JSON.stringify(Object.values(result))
    callback(null, result)}
})

//Pipeline
readStream.pipe(toString).pipe(sortAndProcess).pipe(resultData).pipe(writeStream)

