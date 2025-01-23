-- Custom SQL migration file, put you code below! --

--> create-trigger-function
CREATE OR REPLACE FUNCTION calculate_priority()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.c_total_order_value > 50000 AND NEW.c_total_order_value <= 300000 THEN
		NEW.c_priority := 'Mid';
	ELSIF NEW.c_total_order_value > 300000 THEN
		NEW.c_priority := 'High';
	ELSE
		NEW.c_priority := 'Low';
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--> create-triggers
CREATE OR REPLACE TRIGGER update_priority_trigger
BEFORE UPDATE OF c_total_order_value ON customer
FOR EACH ROW
EXECUTE FUNCTION calculate_priority();