i = 1664
max = 1882
f = File.open("deco.json","w")
f.print("{")
File.open("decorations.txt", "r").each_line do |line|
  line.chomp!
  slots = line[-1]
  name = line.chop!.strip!
  rplce = """
  \"#{i}\": {
    \"name\": \"#{name}\",
    \"skill\": \"\",
    \"slots\": #{slots}
  }"""
  f.print(",\n") unless i == 1544
  f.print(rplce)
  i+=1
end
f.print("}")
