export default function StarIcon({ size = 16, className = "" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={className}
        >
            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.823
               1.516 8.277L12 18.896l-7.452 4.51
               1.516-8.277-6.064-5.823
               8.332-1.151z" />
        </svg>
    );
}
