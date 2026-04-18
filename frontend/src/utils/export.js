import * as XLSX from 'xlsx';

export function exportCustomersToExcel(customers) {
    const rows = customers.map(c => ({
        Name: c.name || '—',
        Phone: c.phone || '—',
        Email: c.email || '—',
        Address: c.address || '—',
        'Added On': c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportOrdersToExcel(orders) {
    const rows = orders.map(o => ({
        'Customer': o.customer_name || '—',
        'Amount (₹)': Number(o.total_amount || 0),
        'Status': o.status || '—',
        'Order Date': o.order_date ? new Date(o.order_date).toLocaleDateString('en-IN') : '—',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
}