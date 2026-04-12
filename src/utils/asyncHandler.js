
//Promise 
const asyncHandler=(requestaHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestaHandler(req,res,next)).
    catch((err)=>next(err))
    }
}

export {asyncHandler}









// try catch async 

// const asyncHandler=(fn)=>async ()=>{
//     try {
//          await fn(req,res,next)

        
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
        
//     }
// }