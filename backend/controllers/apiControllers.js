export function checkHealth (req,res) {
    res.status(200).json({status: "API is healthy"});
}