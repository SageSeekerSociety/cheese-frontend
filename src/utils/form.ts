import { z } from "zod";

export const vuetifyConfig = (state: { errors: any; }) => ({
  props: {
    'error-messages': state.errors,
    error: !!state.errors.length,
  },
});

export const REGEX_PASSWORD = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\x00-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]).{8,}$/;

export const RULE_PASSWORD = z.string().min(8).regex(REGEX_PASSWORD, { message: '密码必须包含字母、数字、特殊字符' });