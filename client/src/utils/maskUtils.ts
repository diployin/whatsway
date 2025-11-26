export const isDemoUser = (username?: string) => {
  return username === "demouser" || username === "demoadmin";
};

export const maskValue = (value: string = "") => {
  if (!value) return "";
  if (value.length <= 2) return "*".repeat(value.length);

  return value.slice(0, -1).replace(/./g, "*") + value.slice(-1);
};
