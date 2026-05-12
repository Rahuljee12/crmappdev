# TODO - Fix “API not calling and not print in console”

- [x] Add debug logging to `hooks/use-leads-criteria.ts` to verify env `EXPO_PUBLIC_ESAF_FETCH_MOBILE` is present and criteria query runs.
- [x] Add debug logging to `hooks/use-leads.ts` to verify `useLeadsQuery()` enabled state and that `queryFn` is invoked.
- [x] Add debug logging to `core/api/http-json.ts` and/or `core/api/esaf-token-provider.ts` to confirm token + request failures show status/body.


- [ ] Reproduce and confirm in console/network logs.
- [ ] If criteria env is missing, fix env wiring (`.env` / app config / expo runtime config).

