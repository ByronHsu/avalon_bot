const arr = [1, 2, 4, 5, 6];
const arr2 = arr.map(u =>{
    if (u !== 2) {
        return u;
    }
    return null;
})

console.log(arr2);