alter table "public"."recurring_cash_flow" drop column "type";

alter table "public"."recurring_cash_flow" alter column "description" drop not null;

alter table "public"."single_cash_flow" drop column "type";

alter table "public"."timer_session" drop column "paid";