export function TestCountsNotice({loading=false}:{loading?:boolean}) {
 return <p className={loading?"mt-2 text-sm text-ink-soft":"notice notice-warn mt-2 text-sm"} role="status">{loading?"Loading test counts…":"Test counts are unavailable or inconsistent. No winner is selected from this reading. Reload to try again; your saved test settings have not been changed."}</p>;
}
