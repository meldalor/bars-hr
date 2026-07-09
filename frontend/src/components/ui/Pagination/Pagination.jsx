import "./Pagination.css";

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    const canGoNext = page < totalPages;

    return (
        <div className="pager">
            <button
                type="button"
                className="pager-more"
                onClick={() => onChange(Math.min(totalPages, page + 1))}
                disabled={!canGoNext}
            >
                Загрузить ещё
            </button>

            <div className="pager-pages" aria-label="Навигация по страницам">
                {pages.map((item) => (
                    <button
                        type="button"
                        key={item}
                        className={`pager-page ${item === page ? "active" : ""}`}
                        onClick={() => onChange(item)}
                        aria-current={item === page ? "page" : undefined}
                    >
                        {item}
                    </button>
                ))}

                <button
                    type="button"
                    className="pager-page pager-next"
                    onClick={() => onChange(Math.min(totalPages, page + 1))}
                    disabled={!canGoNext}
                    aria-label="Следующая страница"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
