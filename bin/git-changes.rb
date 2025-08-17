#!/usr/bin/env ruby

require('time')

#Maintains last login-time by means of a hidden file.  Displays git log
#messages for directories specified by command-line args; if no command-line
#args, then display git log messages for dir containing this script file.

CHANGE_FILE = File.expand_path "#{File.dirname(__FILE__)}/../.last-login"

LOG_FORMAT = '--oneline'

DIRS = ARGV.length == 0 ? [ File.dirname(__FILE__) ] : ARGV

File.new CHANGE_FILE, "w" if !File.exist? CHANGE_FILE
since = File.mtime(CHANGE_FILE).iso8601

DIRS.each do |d|
  system("cd #{d}; git log #{LOG_FORMAT} --since='#{since}'") ||
    warn("cannot git #{d}")
end
         
system "touch #{CHANGE_FILE}"

