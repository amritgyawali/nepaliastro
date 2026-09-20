/**
 * Photography for astrologer portraits and the remedies cards.
 *
 * These are served from Google's CDN and are not guaranteed to live forever,
 * so every portrait goes through `<Avatar />`, which falls back to initials
 * if a fetch fails. To ship fully offline, download these into `assets/` and
 * swap the values here for `require()` calls; nothing else changes.
 */
const CDN = 'https://lh3.googleusercontent.com/aida-public/';

export const photos = {
  vihana:
    CDN +
    'AB6AXuCRcZL5MwBdtb2TQnpgqOpvw72SpmmkKYWcwv50IEYhpEEqztQ3uDe90JbV6jMeblqQM87ureR30AWSb8XVfcsFEXc0H_4HGJ946_s_JD4xTLirFfAn2WUDm_2Tp3McSzqlx6r1Jx9brTM4IPPKPWpRR5H6s5LXx_n74AnEjcWnj7TqW2XGN3V6dpBdsteu423rIwQA9CVcOYTOnfjJEHjOkEZlmdX2tqOZ260ydJhZ3x6P0wCPynokhA',
  vinayyv:
    CDN +
    'AB6AXuDMbxkTY32HLIURHDFCMvWGgBQdZxtDhQ67pwlF9MRqiDSJ7jSTrIZDSQO201fN-bfrpNHUQ1DZljrMfTRWhBlKPNupX9K4aSWAcgaAkE1Gq7Gmp0YtAUMd_radweFlpPh3IPIDoU2KwlmZ8hEmP4URNODGjaioAZWYEBRK_XAvflt9tsHfPf8RBDzYHyiFifDU6mz3t8pqgmzj9JUFTZFV2GLAfCEaRy4kemS_kmjqgADeSyGTLsWgXQ',
  vera:
    CDN +
    'AB6AXuDgF9Sniap1KKyp0C6whtXWD22sqUORBZbk_n2oJJWXLXSXbYFRhSxKonxzT-rmwrfc7H3paDcvBipIvXG8mTwk7cLCwHbVmb3Nb1b7BN5S86TMA9wCWTHfPyXPMbtVrJhKsokx53A3sVf2Ye8VN4I_L2bJwuAjaUgIiZL1FxXkrdhZj4B0hMEkaLjMXH1gAGBrTR9BR2MbH57bwZH8WooAx6_RIYbr_FHKVjid6u1zX-xH5gq5SjG8_A',
  kiran:
    CDN +
    'AB6AXuBBzbAGGZXERZxq-BEfPx2mSuE4eypgb-13sH14W7ZUoX2Yn_YHpmK4Igh2dUpHivMaEcZGlWBv86n3z7Wd2PmQA3N3DLNXnvIa3Fn7CuCVY2i8hy2WpgeWQqcRyNYh9xUu5S0REzDi95mSKCLoPZbQhT8qaB6Bcw3HRetYBmm25GdmUENOGvwn2k00Agy8HkYPQeLza-oDzVbsJHipfqjohBYdfmOEoqThAR6KLcqJb1BfCtyzLswMqA',
  ganesh:
    CDN +
    'AB6AXuA1lKzDLo3wCqWQwffLlG5ZifDVL_-SY-ciBJ04WTYV8APVjyFlo1zeqX2im2fbYKBf80W9VfnDbH7wTa-y96Z9vvi1reLy85f-OvnnnPQEIBsJ1d0f_melrRw3msMNKeEp_w3KCFS9RZgu1uDbKk5uNtEYyA34mrj9N9fR8k24ZtOouyI5IjUHAUIbOKUeW-JcUAAI0Q93C2USwr6LWk7CIx6ElFnxgazFA7Hfkq_Q',
  pooja:
    CDN +
    'AB6AXuBbkkXZhagY9q87Djj3egfNeP945XgNVyVCw7eTQ125F3QhIC1HJZaBdr-hcUIlt4vLj0yzO2vFNHqNJx4dGA0vYKXSRucZbk9gwcFdJDK7tcT1c9o4-gU3KSIoaVmAq3ploGA9Dhi3C5jCxRGKaAiJhWUpXtRAxc31s8buuD2nb_KTY9t7Guer6Ca-b4ImVQEYYdiyQ417vKIppdcPWOjG0Y19fHT3WpvHzJQ06FRP',
  spells:
    CDN +
    'AB6AXuD6KWeaGsoKfMu_IAx6pwG5N3Tth0FaIwFgBNUFonVppLaQCQS7nWTQEDg2292My9FyDICTPhoOI6SLvA-kgmOIKcd9y9LeBGILEheHNSUCb2rjOtuCv6UEiVA5C-m2AnAEbsdGKyPo8giqrmJ3_1xrbPsBIW_jABzBbcSLtQxcN54uQRCNjA92VY98Hr5VAsnAUathp8tmD6CknHVrQUNuV2X-Pfk3xuHGD9P13YRe',
  healings:
    CDN +
    'AB6AXuCHkiQCtzSl0uV6HphRYctPIum6ReM1OLyO2gHBVYNyALYqT2XZYpNfnwY66fGjX6JQNXK_JVxgo3sao7vI0DT9bHnldutn3dKRbyMHJFGdUeIekWtZgU8Mke8LgV-OPPfqcI8Aokw8FcnBi2QgtXAjLDjy75aZZoa9-upljsKVl-HjT_B9k0G8DPWZpiXO0mqOk-_DeGSlJDZeHov5W3qsamJUksY8QZMsBmveUKi6',
} as const;

export type PhotoKey = keyof typeof photos;
