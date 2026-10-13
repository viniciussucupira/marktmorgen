import { funnelRate } from "@/lib/funnel-review";
import { done, is, part } from "./check";

part("Estimated funnel rates preserve uncertainty");
is("valid rate", funnelRate(4, 50), 8);
is("no completions with known opens", funnelRate(0, 50), 0);
is("all completed", funnelRate(50, 50), 100);
is("no denominator stays unknown", funnelRate(0, 0), null);
is("completion exceeds opens", funnelRate(60, 50), null);
is("negative completion", funnelRate(-1, 50), null);
is("negative opens", funnelRate(1, -50), null);
is("unknown completion", funnelRate(Number.NaN, 50), null);
is("unknown opens", funnelRate(1, Number.NaN), null);
is("infinite completion", funnelRate(Infinity, 50), null);
is("infinite opens", funnelRate(1, Infinity), null);
done();
