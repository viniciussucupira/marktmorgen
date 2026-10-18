/** next/navigation for a client component drawn on the server in a test: a router that goes nowhere. */
export const useRouter = () => ({ refresh() {}, push() {}, replace() {}, back() {}, forward() {}, prefetch() {} });
export const usePathname = () => "/studio/deals";
export const useSearchParams = () => new URLSearchParams();
