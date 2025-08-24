export const formatDate = (dateString: string) => {
    try{
        return new Date(dateString).toLocaleString("en-GB", {
            timeZone: "UTC",
        })
    } catch(e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
};
