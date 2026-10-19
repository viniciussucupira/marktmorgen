export function TestCountsNotice({loading=false,retryInPlace=false}:{loading?:boolean;retryInPlace?:boolean}) {
 return <p className={loading?"mt-2 text-sm text-ink-soft":"notice notice-warn mt-2 text-sm"} role="status">{loading?"Loading test counts…":`Test counts are unavailable or inconsistent. No winner is selected from this reading. ${retryInPlace?"Use Refresh results to try again. Your unsaved page edits stay here.":"Reload to try again; your saved test settings have not been changed."}`}</p>;
}
