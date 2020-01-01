const users=[]
const addUser=({id,username,room})=>{
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()
   
    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })
    if(existingUser){
        console.log('exisitnh')
        return {
            error:'Username is in use'
        }
    }
    
    const use={id,username,room}
    users.push(use)
  //  console.log(use)
    return { use}
}
const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)    
    if(index!=-1){
        return users.splice(index,1)[0]
    }
}
const getUser=(id)=>{
    console.log(users[0],id)
    return users.filter((user)=>user.id===id)
}
const getUserInRoom=(room)=>users.filter((user)=>user.room===room)
module.exports={
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}