export const exportToJSON = (data, filename = 'tripsplit-export.json') => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToCSV = (groups, filename = 'tripsplit-export.csv') => {
  let csv = 'Group,Member,Bill Description,Amount,Category,Paid By,Date\n'
  
  groups.forEach(group => {
    group.bills.forEach(bill => {
      const date = bill.date ? new Date(bill.date).toLocaleDateString() : ''
      const paidByName = group.members.find(m => m.id === bill.paidBy)?.name || 'Unknown'
      csv += `"${group.name}","${paidByName}","${bill.description}",${bill.amount},"${bill.category}","${paidByName}","${date}"\n`
    })
  })
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const importFromJSON = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export const generateShareLink = (storageId) => {
  const url = new URL(window.location.href)
  url.searchParams.set('share', storageId)
  return url.toString()
}

