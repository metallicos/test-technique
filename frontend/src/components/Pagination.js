export function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  
    return (
      <nav className="flex justify-center">
        <ul className="inline-flex -space-x-px">
          {pages.map((page) => (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 ml-0 leading-tight border ${
                  currentPage === page
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    )
  }