import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location("public_data",Path(__file__).with_name("check_public_data.py"))
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
class PublicDataTests(unittest.TestCase):
    def test_personal_addresses_are_rejected_without_returning_values(self):
        for domain in ("gmail.com","hotmail.com","outlook.com","icloud.com","proton.me"):
            value="synthetic"+"@"+domain
            self.assertEqual(module.findings(value),["personal-email"])
            self.assertNotIn(value,str(module.findings(value)))
    def test_reserved_and_public_support_addresses_are_allowed(self):
        for value in ("operator"+"@example.test","buyer"+"@example.com","support"+"@marktmorgen.com"):
            self.assertEqual(module.findings(value),[])
    def test_provider_accounts_are_rejected(self):
        for prefix in ("acct","prj","team"):
            self.assertEqual(module.findings(prefix+"_"+"A"*20),["provider-account"])
    def test_cpf_validation(self):
        digits=[1,2,3,4,5,6,7,8,9]
        for size in (9,10):
            digits.append((sum(digits[i]*(size+1-i) for i in range(size))*10%11)%10)
        s="".join(map(str,digits))
        formatted=s[:3]+"."+s[3:6]+"."+s[6:9]+"-"+s[9:]
        self.assertEqual(module.findings(formatted),["cpf"])
        self.assertEqual(module.findings("000"+"."+"000"+"."+"000"+"-"+"00"),[])
    def test_phone_and_residential_labels(self):
        self.assertIn("phone",module.findings("+"+"55"+" "+"85"+" "+"9"*9))
        self.assertIn("residential-address",module.findings("Home address"+": "+"Synthetic location"))
    def test_dates_prices_hashes_and_code_are_not_phone_numbers(self):
        for value in ("2026-10-28","09:46:00","US$449/4490","a"*40,"+234", "gmail.com"):
            self.assertEqual(module.findings(value),[])
if __name__=="__main__":
    unittest.main()
