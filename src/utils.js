exports.allocate = (arr)=>{

}
exports.isIdExist = (arr,id)=>{
    for(let i=0;i<arr.length;i++){
        if(arr[i].id == id) return true;
    }
    return false;
}

exports.shuffle = (arr) => {
    arr.sort((a, b) => 0.5 - Math.random());
    return arr;
  };
  