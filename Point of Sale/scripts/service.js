let service = (() => {
    function getActiveReceipt() {
        let endpoint = `receipts?query={"_acl.creator":"${sessionStorage.getItem("id")}","active":"true"}`;
        return remote.get("appdata", endpoint, "kinvey");
    }

    function createReceipt() {
        let data = {
            active: "true",
            productsCount: 0,
            total: 0,
        };
        return remote.post("appdata", "receipts", data, "kinvey")
    }

    function getEntriesByReceiptId(id) {
        let endpoint = `entries?query={"receiptId":"${id}"}`;
        return remote.get("appdata", endpoint, "kinvey");
    }

    function createEntry(data) {
        return remote.post("appdata", "entries", data, "kinvey");
    }

    function deleteEntryById(id) {
        return remote.remove("appdata", `entries/${id}`, "kinvey");
    }

    function checkoutReceipt(id, data) {
        return remote.update("appdata", `receipts/${id}`, data, "kinvey")
    }

    function getMyReceipts() {
        let endpoint = `receipts?query={"_acl.creator":"${sessionStorage.getItem("id")}","active":"false"}`;
        return remote.get("appdata", endpoint, "kinvey");
    }

    function getReceiptEntries(receiptId) {
        return remote.get("appdata", `entries?query={"receiptId":"${receiptId}"}`, "kinvey");
    }
    return {
        getActiveReceipt,
        createReceipt,
        getEntriesByReceiptId,
        createEntry,
        deleteEntryById,
        checkoutReceipt,
        getMyReceipts,
        getReceiptEntries
    }
})();