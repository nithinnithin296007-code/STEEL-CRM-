import * as XLSX from 'xlsx';

export function exportCustomersToExcel(customers) {
    const rows = customers.map(c => ({
        'Company Name': c.company_name || '—',
        'Contact Name': c.contact_name || '—',
        'Phone': c.phone || '—',
        'Size': c.size || '—',
        'Grade': c.grade || '—',
        'Status': c.status || '—',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportOrdersToExcel(orders) {
    const rows = orders.map(o => ({
        'Company': o.customer_name || '—',
        'Amount (₹)': Number(o.total_amount || 0),
        'Status': o.status || '—',
        'Delivery Date': o.delivery_date ? new Date(o.delivery_date).toLocaleDateString('en-IN') : '—',
        'Notes': o.notes || '—',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
}