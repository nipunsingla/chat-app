const generateMessage=(username,text)=>{
        return{
            username,
            text,
            createdAt:Date().now
        }
}
const generateMessage1=(username,text,time)=>{
    console.log(username,text,time)
    return{
        username,
        text,
        createdAt:time
    }
}
const generateLocation=(username,url)=>{
    return {
        username,
        url,
        createdAt: Date().now
    }
}
module.exports={generateMessage,generateLocation,generateMessage1};