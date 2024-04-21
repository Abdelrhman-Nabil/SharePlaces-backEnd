const gettCoordsForAddress=()=>{
    const lat=Math.random()*100
    const lng=Math.random()*10
    return{

        location: {
            lat: lat,
            lng: lng/2,
          },
    }
}

module.exports=gettCoordsForAddress;