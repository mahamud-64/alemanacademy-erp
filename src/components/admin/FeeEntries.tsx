import { useEffect, useMemo, useState } from "react";
import { Search, ReceiptText } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
type Student = {
  student_id: string;
  student_name: string;
  applying_for: string;
  guardian_name: string | null;
};

type Fee = {
  id: string;
  student_id: string;
  fee_head: string;
  month: string;
  original_amount: number;
  waiver_amount: number;
  payable_amount: number;
  paid_amount: number;
  status: "due" | "paid" | "waived";
};

const money = (n: number) =>
  `৳${n.toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;

const feeName = (key: string, lang: string) =>
  key === "monthly_fee"
    ? lang === "bn"
      ? "মাসিক বেতন"
      : "Monthly Fee"
    : key === "exam_fee"
      ? lang === "bn"
        ? "পরীক্ষার ফি"
        : "Exam Fee"
      : key;
 type PaymentTransaction = {
  id: string;
  receipt_no: string;
  amount_received: number;
  payment_method: string;
  payment_date: string;
  note: string | null;
};

function PaymentHistory({
  studentId,
  refreshKey,
}: {
  studentId: string;
  refreshKey: number;
}) {
  const { t, lang } = useLang();

  const [payments, setPayments] = useState<
    PaymentTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("payment_transactions")
        .select(`
          id,
          receipt_no,
          amount_received,
          payment_method,
          payment_date,
          note
        `)
        .eq("student_id", studentId)
        .order("payment_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Payment history error:",
          error,
        );

        toast.error(
          t(
            "Failed to load payment history.",
            "পেমেন্টের ইতিহাস লোড করা যায়নি।",
          ),
        );

        setPayments([]);
      } else {
        setPayments(data ?? []);
      }

      setLoading(false);
    };

    void loadPayments();
  }, [studentId, refreshKey, t]);

  return (
    <div className="rounded-xl border p-4 mt-4">
      <div className="mb-4 font-semibold">
        {t(
          "Payment History",
          "পেমেন্টের ইতিহাস",
        )}
      </div>

      {loading ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          {t(
            "Loading payment history...",
            "পেমেন্টের ইতিহাস লোড হচ্ছে...",
          )}
        </div>
      ) : payments.length === 0 ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          {t(
            "No payments recorded yet.",
            "এখনও কোনো পেমেন্ট রেকর্ড করা হয়নি।",
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="p-2 text-left">
                  {t(
                    "Receipt No.",
                    "রসিদ নং",
                  )}
                </th>

                <th className="p-2 text-left">
                  {t(
                    "Date",
                    "তারিখ",
                  )}
                </th>

                <th className="p-2 text-right">
                  {t(
                    "Amount",
                    "পরিমাণ",
                  )}
                </th>

                <th className="p-2 text-left">
                  {t(
                    "Method",
                    "মাধ্যম",
                  )}
                </th>

                <th className="p-2 text-left">
                  {t(
                    "Note",
                    "নোট",
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b last:border-0"
                >
                  <td className="p-2 font-medium">
                    {payment.receipt_no}
                  </td>

                  <td className="p-2">
                    {new Date(
                      payment.payment_date,
                    ).toLocaleDateString(
                      lang === "bn"
                        ? "bn-BD"
                        : "en-BD",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </td>

                  <td className="p-2 text-right font-medium">
                    {money(
                      Number(
                        payment.amount_received,
                      ),
                    )}
                  </td>

                  <td className="p-2 capitalize">
                    {payment.payment_method}
                  </td>

                  <td className="p-2 text-muted-foreground">
                    {payment.note || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}     
export function FeeEntries() {

  const [receiptNo, setReceiptNo] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastPaidAmount, setLastPaidAmount] = useState(0);
  const { t, lang } = useLang();

  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const [received, setReceived] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [note, setNote] = useState("");

  const [applyWaiver, setApplyWaiver] = useState(false);
  const [waiverType, setWaiverType] =
    useState<"fixed" | "percentage">("fixed");
  const [waiverValue, setWaiverValue] = useState("");
  const [waiverApplies, setWaiverApplies] = useState("total");
  const [waiverReason, setWaiverReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentHistoryRefresh, setPaymentHistoryRefresh] = useState(0);
  // --------------------------------------------------
  // LOAD STUDENTS
  // --------------------------------------------------

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("students")
        .select(
          "student_id,student_name,applying_for,guardian_name",
        )
        .eq("status", "active")
        .order("student_name");

      if (error) {
        toast.error(
          t(
            "Failed to load students.",
            "শিক্ষার্থী লোড করা যায়নি।",
          ),
        );
        return;
      }

      setStudents(data ?? []);
    };

    void load();
  }, [t]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const classes = useMemo(
    () =>
      [...new Set(
        students.map((s) => s.applying_for),
      )],
    [students],
  );

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((s) => {
      const matchesSearch =
        !q ||
        s.student_id.toLowerCase().includes(q) ||
        s.student_name.toLowerCase().includes(q);

      const matchesClass =
        !classFilter ||
        s.applying_for === classFilter;

      return matchesSearch && matchesClass;
    });
  }, [students, search, classFilter]);

  // --------------------------------------------------
  // LOAD SELECTED STUDENT FEES
  // --------------------------------------------------

  const selectStudent = async (student: Student) => {
    setSelected(student);
    setLoading(true);

    const { data, error } = await supabase
      .from("fee_payments")
      .select(
        "id,student_id,fee_head,month,original_amount,waiver_amount,payable_amount,paid_amount,status",
      )
      .eq("student_id", student.student_id)
      .neq("status", "paid")
      .neq("status", "waived")
      .order("month", { ascending: false });

    setLoading(false);

    if (error) {
      console.error(error);

      toast.error(
        t(
          "Failed to load fees.",
          "ফি লোড করা যায়নি।",
        ),
      );

      setFees([]);
      return;
    }

    setFees(data ?? []);
    setReceived("");
  };

  // --------------------------------------------------
  // FEES
  // --------------------------------------------------

  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7);

  const currentFees = fees.filter(
    (f) => f.month.slice(0, 7) === currentMonth,
  );

  const previousFees = fees.filter(
    (f) => f.month.slice(0, 7) < currentMonth,
  );

  const examFees = fees.filter(
    (f) => f.fee_head === "exam_fee",
  );

  const totalOriginal = fees.reduce(
    (sum, f) =>
        sum +
        Math.max(
        0,
        f.payable_amount - f.paid_amount,
        ),
    0,
  );

  // --------------------------------------------------
  // WAIVER
  // --------------------------------------------------

  const applicableAmount =
    waiverApplies === "total"
      ? totalOriginal
      : fees
          .filter(
            (f) => f.fee_head === waiverApplies,
          )
          .reduce(
            (sum, f) => sum + f.payable_amount,
            0,
          );

  const rawWaiver = Number(waiverValue) || 0;

  const waiverAmount = !applyWaiver
    ? 0
    : waiverType === "percentage"
      ? Math.min(
          applicableAmount,
          (applicableAmount * rawWaiver) / 100,
        )
      : Math.min(
          applicableAmount,
          rawWaiver,
        );

  const totalPayable = Math.max(
    0,
    totalOriginal - waiverAmount,
  );

  // --------------------------------------------------
  // RECORD PAYMENT
  // --------------------------------------------------

    const recordPayment = async () => {
        if (!selected || !fees.length) return;

        const amount = Number(received) || 0;

        if (amount <= 0) {
            toast.error(
            t(
                "Enter the amount received.",
                "প্রাপ্ত টাকার পরিমাণ দিন।",
            ),
            );
            return;
        }

        if (amount > totalPayable) {
            toast.error(
            t(
                "Amount received cannot exceed payable amount.",
                "প্রাপ্ত টাকা পরিশোধযোগ্য টাকার চেয়ে বেশি হতে পারবে না।",
            ),
            );
            return;
        }

        if (applyWaiver && !waiverReason.trim()) {
            toast.error(
            t(
                "Enter a waiver reason.",
                "মওকুফের কারণ দিন।",
            ),
            );
            return;
        }

        setSaving(true);

        try {
            const { data, error } = await supabase.rpc(
            "record_payment",
            {
                p_student_id: selected.student_id,
                p_amount: amount,
                p_payment_method: paymentMode,
                p_payment_date:
                paymentDate ||
                new Date().toISOString().slice(0, 10),
                p_note: note.trim() || null,

                p_apply_waiver: applyWaiver,
                p_waiver_type: waiverType,
                p_waiver_value:
                Number(waiverValue) || 0,
                p_waiver_applies: waiverApplies,
                p_waiver_reason:
                waiverReason.trim() || null,
            },
            );

            if (error) {
            console.error("record_payment RPC error:", error);

            toast.error(
                error.message ||
                t(
                    "Payment could not be recorded.",
                    "পেমেন্ট রেকর্ড করা যায়নি।",
                ),
            );

            return;
            }

            if (!data?.success) {
            toast.error(
                t(
                "Payment could not be recorded.",
                "পেমেন্ট রেকর্ড করা যায়নি।",
                ),
            );

            return;
            }

            // -----------------------------
            // SUCCESS
            // -----------------------------

            setReceiptNo(data.receipt_no);
            setPaymentSuccess(true);
            setLastPaidAmount(Number(data.amount_received));
            setPaymentHistoryRefresh((prev) => prev + 1);
            toast.success(
            t(
                "Payment recorded successfully.",
                "পেমেন্ট সফলভাবে সংরক্ষণ হয়েছে।",
            ),
            );

            // Clear form
            setReceived("");
            setNote("");
            setApplyWaiver(false);
            setWaiverValue("");
            setWaiverReason("");
            setWaiverType("fixed");
            setWaiverApplies("total");

            // Reload current dues
            await selectStudent(selected);
        } catch (error) {
            console.error("Payment error:", error);

            toast.error(
            t(
                "Something went wrong while recording payment.",
                "পেমেন্ট রেকর্ড করার সময় সমস্যা হয়েছে।",
            ),
            );
        } finally {
            setSaving(false);
        }
        };

  return (
    <div className="space-y-4">
      {/* FIND STUDENT */}
      <div className="rounded-xl border p-4">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <Search className="h-4 w-4" />
          {t("Find student", "শিক্ষার্থী খুঁজুন")}
        </div>

        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => {
                const value = e.target.value;

                setSearch(value);

                // Clear currently selected student
                // when starting a new search
                setSelected(null);

                // Clear old payment/receipt state
                setPaymentSuccess(false);
                setReceiptNo("");
                setLastPaidAmount(0);
                }}
            placeholder={t(
              "Search by name or Student ID...",
              "নাম বা Student ID দিয়ে খুঁজুন...",
            )}
          />

          <select
            value={classFilter}
            onChange={(e) =>
              setClassFilter(e.target.value)
            }
            className="h-10 rounded-md border bg-background px-3"
          >
            <option value="">
              {t("All classes", "সব শ্রেণি")}
            </option>

            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {search && !selected && (
          <div className="mt-2 max-h-48 overflow-auto rounded-md border">
            {results.map((student) => (
              <button
                key={student.student_id}
                onClick={() =>
                  void selectStudent(student)
                }
                className="w-full border-b p-3 text-left hover:bg-muted"
              >
                <div className="font-medium">
                  {student.student_name}
                </div>

                <div className="text-xs text-muted-foreground">
                  {student.student_id} ·{" "}
                  {student.applying_for}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          {/* STUDENT + FEES */}
          <div className="rounded-xl border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {selected.student_name}
                </div>

                <div className="text-sm text-muted-foreground">
                  {selected.applying_for} ·{" "}
                  {selected.student_id}
                </div>

                {selected.guardian_name && (
                  <div className="text-xs text-muted-foreground">
                    {t("Guardian", "অভিভাবক")}:{" "}
                    {selected.guardian_name}
                  </div>
                )}
              </div>

              <div className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-500">
                {fees.length}{" "}
                {t("dues", "বকেয়া")}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="p-2 text-left">
                      {t("Category", "ধরন")}
                    </th>
                    <th className="p-2 text-right">
                      {t("Amount", "পরিমাণ")}
                    </th>
                    <th className="p-2 text-left">
                      {t("Due date", "তারিখ")}
                    </th>
                    <th className="p-2 text-right">
                      {t("Status", "অবস্থা")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {fees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="border-b"
                    >
                      <td className="p-2">
                        {feeName(
                          fee.fee_head,
                          lang,
                        )}
                      </td>

                      <td className="p-2 text-right">
                        {money(
                            Math.max(
                                0,
                                fee.payable_amount - fee.paid_amount,
                            ),
                        )}
                      </td>

                      <td className="p-2">
                        {new Date(
                          fee.month,
                        ).toLocaleDateString(
                          lang === "bn"
                            ? "bn-BD"
                            : "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>

                      <td className="p-2 text-right text-red-500">
                        {t("Due", "বকেয়া")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="py-4 text-center text-sm">
                {t(
                  "Loading fees...",
                  "ফি লোড হচ্ছে...",
                )}
              </div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="rounded-xl border p-4">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <ReceiptText className="h-4 w-4" />
              {t(
                "Record payment",
                "পেমেন্ট রেকর্ড করুন",
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>
                  {t(
                    "Total Payable",
                    "মোট পরিশোধযোগ্য",
                  )}
                </Label>

                <Input
                  value={`${money(
                    totalPayable,
                  )} ${t("due", "বকেয়া")}`}
                  readOnly
                />
              </div>

              <div>
                <Label>
                  {t(
                    "Amount Received",
                    "প্রাপ্ত টাকা",
                  )}
                </Label>

                <Input
                  type="number"
                  min="0"
                  value={received}
                  onChange={(e) =>
                    setReceived(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  {t(
                    "Payment Mode",
                    "পেমেন্ট মাধ্যম",
                  )}
                </Label>

                <select
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(
                      e.target.value,
                    )
                  }
                  className="mt-1 h-10 w-full rounded-md border bg-background px-3"
                >
                  <option value="cash">
                    {t("Cash", "নগদ")}
                  </option>

                  <option value="bank">
                    {t("Bank", "ব্যাংক")}
                  </option>

                  <option value="mobile">
                    {t(
                      "Mobile Banking",
                      "মোবাইল ব্যাংকিং",
                    )}
                  </option>
                </select>
              </div>

              <div>
                <Label>
                  {t(
                    "Date Received",
                    "গ্রহণের তারিখ",
                  )}
                </Label>

                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) =>
                    setPaymentDate(
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="mt-3">
              <Label>
                {t("Note", "নোট")}
              </Label>

              <Input
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder={t(
                  "Optional note...",
                  "ঐচ্ছিক নোট...",
                )}
              />
            </div>

            {/* OPTIONAL WAIVER */}
            <div className="mt-4 rounded-lg border p-3">
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={applyWaiver}
                  onChange={(e) => {
                    const checked =
                      e.target.checked;

                    setApplyWaiver(
                      checked,
                    );

                    if (!checked) {
                      setWaiverValue("");
                      setWaiverReason("");
                      setWaiverType(
                        "fixed",
                      );
                      setWaiverApplies(
                        "total",
                      );
                    }
                  }}
                />

                {t(
                  "Apply Waiver",
                  "মওকুফ প্রয়োগ করুন",
                )}
              </label>

              {applyWaiver && (
                <div className="mt-3 space-y-3 rounded-lg border p-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label>
                        {t("Type", "ধরন")}
                      </Label>

                      <select
                        value={waiverType}
                        onChange={(e) =>
                          setWaiverType(
                            e.target
                              .value as
                              | "fixed"
                              | "percentage",
                          )
                        }
                        className="mt-1 h-10 w-full rounded-md border bg-background px-3"
                      >
                        <option value="fixed">
                          {t(
                            "Fixed amount",
                            "নির্দিষ্ট পরিমাণ",
                          )}
                        </option>

                        <option value="percentage">
                          {t(
                            "Percentage",
                            "শতাংশ",
                          )}
                        </option>
                      </select>
                    </div>

                    <div>
                      <Label>
                        {t(
                          "Value",
                          "পরিমাণ",
                        )}
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        value={waiverValue}
                        onChange={(e) =>
                          setWaiverValue(
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>
                      {t(
                        "Applies to",
                        "প্রযোজ্য",
                      )}
                    </Label>

                    <select
                      value={waiverApplies}
                      onChange={(e) =>
                        setWaiverApplies(
                          e.target.value,
                        )
                      }
                      className="mt-1 h-10 w-full rounded-md border bg-background px-3"
                    >
                      <option value="total">
                        {t(
                          "Total dues",
                          "মোট বকেয়া",
                        )}
                      </option>

                      <option value="monthly_fee">
                        {t(
                          "Monthly Fee",
                          "মাসিক বেতন",
                        )}
                      </option>

                      <option value="exam_fee">
                        {t(
                          "Exam Fee",
                          "পরীক্ষার ফি",
                        )}
                      </option>
                    </select>
                  </div>

                  <div>
                    <Label>
                      {t(
                        "Reason",
                        "কারণ",
                      )}
                    </Label>

                    <Input
                      value={waiverReason}
                      onChange={(e) =>
                        setWaiverReason(
                          e.target.value,
                        )
                      }
                      placeholder={t(
                        "Financial hardship",
                        "আর্থিক অসচ্ছলতা",
                      )}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>
                      {t(
                        "Waiver amount",
                        "মওকুফের পরিমাণ",
                      )}
                    </span>

                    <span className="font-medium">
                      −{money(
                        waiverAmount,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between font-semibold">
                    <span>
                      {t(
                        "Payable after waiver",
                        "মওকুফের পর পরিশোধযোগ্য",
                      )}
                    </span>

                    <span>
                      {money(
                        totalPayable,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1"
                disabled={saving}
                onClick={() =>
                  void recordPayment()
                }
              >
                {saving
                  ? t(
                      "Saving...",
                      "সংরক্ষণ হচ্ছে...",
                    )
                  : t(
                      "Record payment and generate receipt & SMS",
                      "পেমেন্ট রেকর্ড করে রসিদ ও SMS তৈরি করুন",
                    )}
              </Button>

              <Button
                variant="outline"
                disabled={saving}
              >
                {t(
                  "Save as draft",
                  "ড্রাফট সংরক্ষণ",
                )}
              </Button>
            </div>
            {paymentSuccess && receiptNo && (
                <div className="rounded-xl border p-4">
                    <div className="font-semibold text-green-600">
                    ✓{" "}
                    {t(
                        "Payment Successful",
                        "পেমেন্ট সফল হয়েছে",
                    )}
                    </div>

                    <div className="mt-3 space-y-1 text-sm">
                    <div>
                        {t("Receipt No.", "রসিদ নম্বর")}:{" "}
                        <strong>{receiptNo}</strong>
                    </div>

                    <div>
                        {t("Student", "শিক্ষার্থী")}:{" "}
                        {selected.student_name}
                    </div>

                    <div>
                        {t("Student ID", "Student ID")}:{" "}
                        {selected.student_id}
                    </div>

                    <div>
                        {t("Amount Paid", "পরিশোধিত")}:{" "}
                        <strong>{money(lastPaidAmount)}</strong>
                    </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                    <Button
                        onClick={() => {
                            window.open(
                            `/admin/fees/receipt/${receiptNo}`,
                            "_blank",
                            );
                        }}
                    >
                        {t("View Receipt", "রসিদ দেখুন")}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            window.print();
                        }}
                    >
                        {t("Print Receipt", "রসিদ প্রিন্ট")}
                    </Button>
                    </div>

                    <div className="mt-4 rounded-lg border p-3">
                    <div className="font-medium">
                        📱 {t("SMS", "SMS")}
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                        {t(
                        "SMS will be sent to the guardian.",
                        "অভিভাবকের নম্বরে SMS পাঠানো হবে।",
                        )}
                    </div>

                     <Button
                        variant="outline"
                        className="mt-3"
                        onClick={async () => {
                            if (!receiptNo) return;

                            const { data, error } =
                            await supabase.functions.invoke(
                                "send-payment-sms",
                                {
                                body: {
                                    receipt_no: receiptNo,
                                    amount: lastPaidAmount,
                                },
                                },
                            );

                            if (error || !data?.success) {
                            console.error(error || data);

                            toast.error(
                                t(
                                "SMS could not be sent.",
                                "SMS পাঠানো যায়নি।",
                                ),
                            );

                            return;
                            }

                            toast.success(
                            t(
                                "SMS sent successfully.",
                                "SMS সফলভাবে পাঠানো হয়েছে।",
                            ),
                            );
                        }}
                        >
                        {t("Send SMS", "SMS পাঠান")}
                     </Button>
                    </div>
                </div>
                )}
          </div>

        {/* PAYMENT HISTORY */}
        <PaymentHistory
          studentId={selected.student_id}
         refreshKey={paymentHistoryRefresh}
        />
        </>
      )}
    </div>
  );
}
