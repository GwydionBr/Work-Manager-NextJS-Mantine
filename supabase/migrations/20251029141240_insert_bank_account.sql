create table "public"."bank_account" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "description" text,
    "currency" currency not null,
    "saldo" double precision not null default '0'::double precision,
    "saldo_set_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text)
);


alter table "public"."bank_account" enable row level security;

CREATE UNIQUE INDEX bank_account_pkey ON public.bank_account USING btree (id);

alter table "public"."bank_account" add constraint "bank_account_pkey" PRIMARY KEY using index "bank_account_pkey";

grant delete on table "public"."bank_account" to "anon";

grant insert on table "public"."bank_account" to "anon";

grant references on table "public"."bank_account" to "anon";

grant select on table "public"."bank_account" to "anon";

grant trigger on table "public"."bank_account" to "anon";

grant truncate on table "public"."bank_account" to "anon";

grant update on table "public"."bank_account" to "anon";

grant delete on table "public"."bank_account" to "authenticated";

grant insert on table "public"."bank_account" to "authenticated";

grant references on table "public"."bank_account" to "authenticated";

grant select on table "public"."bank_account" to "authenticated";

grant trigger on table "public"."bank_account" to "authenticated";

grant truncate on table "public"."bank_account" to "authenticated";

grant update on table "public"."bank_account" to "authenticated";

grant delete on table "public"."bank_account" to "service_role";

grant insert on table "public"."bank_account" to "service_role";

grant references on table "public"."bank_account" to "service_role";

grant select on table "public"."bank_account" to "service_role";

grant trigger on table "public"."bank_account" to "service_role";

grant truncate on table "public"."bank_account" to "service_role";

grant update on table "public"."bank_account" to "service_role";